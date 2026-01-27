// Backend API endpoint for OpenAI - API key stays secure on server
// Deploy this to Vercel, Netlify, or Firebase Cloud Functions

import OpenAI from 'openai';

// API key stored as environment variable on the backend (NEVER in the app)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vercel serverless function export
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput } = req.body;

  if (!userInput || !userInput.trim()) {
    return res.status(400).json({ error: 'User input is required' });
  }

  // Base system prompt (will be modified dynamically on retries)
  const baseSystemPrompt = `You are a compassionate Christian spiritual guide. Find the Bible verse that BEST matches the SPECIFIC details of the user's situation.

MATCHING PRIORITY: Match specific context, not just general emotion:
- Work/career → verses about work, vocation, labor
- School/studying → verses about learning, wisdom, education
- Relationships/family → verses about relationships, love, community
- Health/illness → verses about healing, strength, the body
- Finances/money → verses about provision, wealth, material needs

SELECTION: Choose the verse that best matches their specific details. Common verses are fine if they match well; less common verses are fine if they match better. Best match > popularity.

CRITICAL REQUIREMENTS:
- You MUST include the COMPLETE verse text from start to finish - never truncate or cut off mid-sentence
- The verse text must be the full, accurate Bible verse text
- Respond with ONLY valid JSON. No markdown, no code blocks, no extra text. JSON must be complete and valid.

Required JSON structure:
{
  "reference": "Psalm 23:4",
  "text": "The complete, full verse text here - never incomplete or cut off",
  "explanation": "2-3 sentences explaining why this verse applies. Keep tone warm and comforting, not preachy."
}`;

  // Helper function to extract verse reference from content (even if JSON is broken)
  function extractReference(content) {
    if (!content) return null;
    
    try {
      // Try parsing full JSON first
      const parsed = JSON.parse(content);
      return parsed.reference || null;
    } catch (e) {
      // JSON is broken - use regex to extract reference
      const refMatch = content.match(/"reference":\s*"([^"]+)"/);
      return refMatch ? refMatch[1] : null;
    }
  }

  // Helper function to detect if verse text is incomplete
  function isVerseIncomplete(verseData) {
    if (!verseData || !verseData.text) return true;
    
    const text = verseData.text.trim();
    
    // Too short (most verses are longer than 30 chars)
    if (text.length < 30) return true;
    
    // Ends with ellipsis (was cut off)
    if (text.endsWith('...')) return true;
    
    // Doesn't end with proper punctuation or closing quote
    if (!text.match(/[.!?;]$/) && !text.endsWith('"')) {
      // Check for common incomplete patterns
      const incompletePatterns = [
        /will guard your$/,  // "will guard your" (should be "will guard your hearts...")
        /and [a-z]+$/,       // Ends with "and [word]" mid-sentence
        /the [a-z]+$/,       // Ends with "the [word]" mid-sentence
        /in [a-z]+$/,        // Ends with "in [word]" mid-sentence
        /with [a-z]+$/,      // Ends with "with [word]" mid-sentence
        /by [a-z]+$/,        // Ends with "by [word]" mid-sentence
      ];
      
      for (const pattern of incompletePatterns) {
        if (pattern.test(text)) return true;
      }
      
      // If it doesn't end with punctuation and is suspiciously short for a complete sentence
      if (text.length < 100 && !text.match(/[.!?]$/)) {
        return true;
      }
    }
    
    return false;
  }

  // Helper function to build system prompt with exclusion list
  function buildSystemPrompt(attemptedVerses) {
    let prompt = baseSystemPrompt;
    
    if (attemptedVerses.length > 0) {
      prompt += `\n\nIMPORTANT: The following verses were attempted but returned incomplete responses. Please choose a DIFFERENT verse that matches the user's situation:\n${attemptedVerses.map(v => `- ${v}`).join('\n')}\n\nDo not use any of the verses listed above. Choose a different verse that is still relevant to the user's situation.`;
    }
    
    return prompt;
  }

  try {
    // Retry logic with verse tracking (max 3 attempts)
    let verseData = null;
    let lastError = null;
    const attemptedVerses = []; // Track verses that failed
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== API Call Attempt ${attempt}/${maxRetries} ===`);
        if (attemptedVerses.length > 0) {
          console.log(`Excluding previously attempted verses: ${attemptedVerses.join(', ')}`);
        }
        
        // Build dynamic prompt that excludes attempted verses
        const currentSystemPrompt = buildSystemPrompt(attemptedVerses);
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: currentSystemPrompt },
            { role: 'user', content: userInput.trim() },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.85, // Increased for more variety in verse selection while maintaining accuracy
          max_tokens: 3000, // Increased significantly to prevent cut-off for longer verses with explanations
        });

        const choice = completion.choices[0];
        const content = choice?.message?.content;
        const finishReason = choice?.finish_reason;

        if (!content) {
          throw new Error('No response from OpenAI');
        }

        // Log diagnostic info FIRST before any parsing attempts
        console.log('=== OpenAI Response Diagnostics ===');
        console.log('Finish reason:', finishReason);
        console.log('Token usage:', JSON.stringify(completion.usage, null, 2));
        
        // Clean the content - remove any leading/trailing whitespace
        const cleanedContent = content.trim();
        
        // If content_filter or length triggered, extract reference and retry with different verse
        if (finishReason === 'content_filter' || finishReason === 'length') {
          console.warn(`⚠️ WARNING: Response cut off (finish_reason: ${finishReason}) on attempt ${attempt}`);
          
          // Extract reference from incomplete response
          const extractedRef = extractReference(cleanedContent);
          if (extractedRef && !attemptedVerses.includes(extractedRef)) {
            attemptedVerses.push(extractedRef);
            console.log(`Extracted reference from incomplete response: ${extractedRef}`);
          }
          
          if (attempt < maxRetries) {
            console.warn('Retrying with different verse...');
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            continue; // Retry with updated exclusion list
          } else {
            console.error('❌ All retry attempts failed');
            throw new Error(`Response was cut off after ${maxRetries} attempts. Tried verses: ${attemptedVerses.join(', ')}`);
          }
        }
        
        // Log the raw content for debugging
        console.log('Response length (chars):', cleanedContent.length);
        console.log('Response preview (first 500 chars):', cleanedContent.substring(0, 500));
        console.log('Response preview (last 200 chars):', cleanedContent.substring(Math.max(0, cleanedContent.length - 200)));

        // Parse JSON response
        try {
          // First, try direct parse of cleaned content
          verseData = JSON.parse(cleanedContent);
          console.log('✅ Successfully parsed JSON');
          
          // Validate required fields
          if (!verseData.reference || !verseData.text || !verseData.explanation) {
            throw new Error('Missing required fields in parsed JSON');
          }
          
          // Check if verse is actually complete (not just valid JSON)
          if (isVerseIncomplete(verseData)) {
            console.warn(`⚠️ Verse appears incomplete: "${verseData.text.substring(0, 50)}..."`);
            console.warn(`Reference: ${verseData.reference}`);
            
            // Add to attempted list and retry
            if (!attemptedVerses.includes(verseData.reference)) {
              attemptedVerses.push(verseData.reference);
              console.log(`Added to exclusion list: ${verseData.reference}`);
            }
            
            if (attempt < maxRetries) {
              console.warn(`Retrying with different verse (attempt ${attempt + 1}/${maxRetries})...`);
              verseData = null; // Reset for retry
              await new Promise(resolve => setTimeout(resolve, 500 * attempt));
              continue; // Retry with updated exclusion list
            } else {
              // Last attempt - try to use what we have even if incomplete
              console.warn('⚠️ Using incomplete verse as fallback on final attempt');
              break;
            }
          }
          
          // Verse is complete and valid! Success!
          console.log(`✅ Successfully got complete verse: ${verseData.reference}`);
          break;
          
        } catch (parseError) {
          console.error('JSON parse error on attempt', attempt, ':', parseError.message);
          console.error('Content that failed to parse (first 500 chars):', cleanedContent.substring(0, 500));
          
          // Extract reference even from broken JSON
          const extractedRef = extractReference(cleanedContent);
          if (extractedRef && !attemptedVerses.includes(extractedRef)) {
            attemptedVerses.push(extractedRef);
            console.log(`Extracted reference from broken JSON: ${extractedRef}`);
          }
          
          // Try repair logic (only on last attempt)
          if (attempt === maxRetries) {
            console.warn('⚠️ Attempting to repair incomplete JSON response on final attempt');
            
            // Check if the response looks incomplete (missing closing quote/brace)
            const hasOpenString = (cleanedContent.match(/"/g) || []).length % 2 !== 0;
            const hasOpenBrace = (cleanedContent.match(/\{/g) || []).length > (cleanedContent.match(/\}/g) || []).length;
            
            console.log('Has open string:', hasOpenString, 'Has open brace:', hasOpenBrace);
            
            if (hasOpenString || hasOpenBrace) {
              let repaired = cleanedContent.trim();
              
              // If text field is open (most common case), close it properly
              if (repaired.includes('"text":')) {
                const textMatch = repaired.match(/"text":\s*"([^"]*)$/);
                if (textMatch) {
                  // Text field is incomplete - close it
                  const incompleteText = textMatch[1];
                  const beforeIncompleteText = repaired.substring(0, repaired.lastIndexOf(incompleteText));
                  repaired = beforeIncompleteText + incompleteText.trim() + '",\n  "explanation": "This verse offers comfort and guidance for your situation."\n}';
                  
                  console.log('Attempting repair - closing incomplete text field');
                  try {
                    verseData = JSON.parse(repaired);
                    // Check if repaired verse is still incomplete
                    if (isVerseIncomplete(verseData)) {
                      console.warn('⚠️ Repaired verse is still incomplete, but using as fallback');
                    } else {
                      console.log('✅ Successfully repaired and parsed incomplete JSON');
                    }
                    break; // Use repaired version
                  } catch (repairError) {
                    console.error('❌ Failed to repair JSON:', repairError.message);
                    lastError = parseError;
                  }
                }
              }
            }
            
            // If repair failed, this attempt failed
            if (!verseData) {
              lastError = parseError;
            }
          } else {
            // Not last attempt - retry with different verse
            console.warn(`Parse failed on attempt ${attempt}, will retry with different verse...`);
            lastError = parseError;
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            continue; // Retry loop with updated exclusion list
          }
        }
      } catch (apiError) {
        // API call failed (network, etc.)
        console.error('API call error on attempt', attempt, ':', apiError.message);
        lastError = apiError;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          continue; // Retry
        }
      }
    } // End retry loop
    
    // Check if we got valid data
    if (!verseData) {
      const errorMsg = lastError?.message || 'Failed to get valid response after all retries';
      const usageInfo = lastError?.usage 
        ? ` Tokens: ${lastError.usage.total_tokens}`
        : '';
      throw new Error(`${errorMsg}${usageInfo}`);
    }

    // Validate response structure
    if (!verseData.reference || !verseData.text || !verseData.explanation) {
      throw new Error('Invalid response format from OpenAI: missing required fields');
    }

    return res.status(200).json(verseData);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get verse',
    });
  }
}

