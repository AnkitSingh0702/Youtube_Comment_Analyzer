// 'use server';

// import { GoogleGenerativeAI } from '@google/generative-ai';
// import clientPromise from '@/lib/db';
// import { getVideoComments, extractVideoId } from '@/lib/youtube';

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);


// async function retryWithBackoff(func: Function, maxRetries = 3, delay = 1000) {
//   let retries = 0;
//   while (retries < maxRetries) {
//     try {
//       return await func();
//     } catch (error: any) {
//       if (error.code === 429 || error.status === 429) {
//         retries++;
//         await new Promise((resolve) => setTimeout(resolve, delay * retries));
//       } else {
//         throw error;
//       }
//     }
//   }
//   throw new Error('Max retries reached');
// }

// async function analyzeSentiment(comment: string): Promise<string> {
//   const prompt = `Analyze if this YouTube comment agrees, disagrees, or is neutral about the video content. Only respond with one word: "agree", "disagree", or "neutral". Here's the comment: "${comment}"`;

//   try {
//     const result = await retryWithBackoff(() =>
//       genAI.generateText({
//         model: 'gemini-pro',
//         prompt,
//       })
//     );

//     const text = result.candidates[0]?.content?.trim().toLowerCase();

//     if (text.includes('agree')) return 'agree';
//     if (text.includes('disagree')) return 'disagree';
//     return 'neutral';
//   } catch (error) {
//     console.error(`Error analyzing sentiment for comment: "${comment}". Error:`, error);
//     return 'neutral'; // Default to neutral if there's an error
//   }
// }

// export async function analyzeComments(prevState: any, formData: FormData) {
//   try {
//     const url = formData.get('url') as string;
//     const videoId = extractVideoId(url);

//     if (!videoId) {
//       return { success: false, error: 'Invalid YouTube URL' };
//     }

//     const comments = await getVideoComments(videoId);
//     const results = {
//       agree: 0,
//       disagree: 0,
//       neutral: 0,
//       distribution: {} as Record<string, number>,
//       total: comments.length,
//     };

//     const analyzedComments = await Promise.all(
//       comments.map(async (comment: any) => {
//         const text = comment.snippet.topLevelComment.snippet.textDisplay;
//         const publishedAt = new Date(comment.snippet.topLevelComment.snippet.publishedAt);
//         const monthYear = `${publishedAt.getFullYear()}-${String(publishedAt.getMonth() + 1).padStart(2, '0')}`;

//         results.distribution[monthYear] = (results.distribution[monthYear] || 0) + 1;

//         try {
//           const sentiment = await analyzeSentiment(text);
//           results[sentiment as keyof typeof results]++;
//           return {
//             text,
//             sentiment,
//             publishedAt,
//             maskedUsername: `User_${Math.random().toString(36).substr(2, 9)}`,
//           };
//         } catch (error) {
//           console.error(`Error analyzing comment: "${text}". Error:`, error);
//           results.neutral++; // Default to neutral if there's an error
//           return {
//             text,
//             sentiment: 'neutral',
//             publishedAt,
//             maskedUsername: `User_${Math.random().toString(36).substr(2, 9)}`,
//           };
//         }
//       })
//     );

//     const client = await clientPromise;
//     const db = client.db('youtube-analyzer');
//     await db.collection('analyses').insertOne({
//       videoId,
//       analyzedAt: new Date(),
//       comments: analyzedComments,
//       results,
//     });

//     return { success: true, results };
//   } catch (error: any) {
//     console.error('Error analyzing comments:', error);
//     return { success: false, error: error.message };
//   }
// }


'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import clientPromise from '@/lib/db';
import { getVideoComments, extractVideoId } from '@/lib/youtube';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

async function retryWithBackoff(func: Function, maxRetries = 3, delay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await func();
    } catch (error: any) {
      if (error.code === 429 || error.status === 429) {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, delay * retries));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
}

async function analyzeSentiment(comment: string): Promise<string> {
  const prompt = `Analyze if this YouTube comment agrees, disagrees, or is neutral about the video content. Only respond with one word: "agree", "disagree", or "neutral". Here's the comment: "${comment}"`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await retryWithBackoff(() =>
      model.generateContent(prompt)
    );

    const text = result.candidates[0]?.content?.trim().toLowerCase();

    if (text.includes('agree')) return 'agree';
    if (text.includes('disagree')) return 'disagree';
    return 'neutral';
  } catch (error) {
    console.error(`Error analyzing sentiment for comment: "${comment}". Error:`, error);
    return 'neutral'; // Default to neutral if there's an error
  }
}

export async function analyzeComments(prevState: any, formData: FormData) {
  try {
    const url = formData.get('url') as string;
    const videoId = extractVideoId(url);

    if (!videoId) {
      return { success: false, error: 'Invalid YouTube URL' };
    }

    const comments = await getVideoComments(videoId, { maxResults: 100 });
    const results = {
      agree: 0,
      disagree: 0,
      neutral: 0,
      distribution: {} as Record<string, number>,
      total: comments.length,
    };

    const analyzedComments = await Promise.all(
      comments.map(async (comment: any) => {
        const text = comment.snippet.topLevelComment.snippet.textDisplay;
        const publishedAt = new Date(comment.snippet.topLevelComment.snippet.publishedAt);
        const monthYear = `${publishedAt.getFullYear()}-${String(publishedAt.getMonth() + 1).padStart(2, '0')}`;

        results.distribution[monthYear] = (results.distribution[monthYear] || 0) + 1;

        try {
          const sentiment = await analyzeSentiment(text);
          results[sentiment as keyof typeof results]++;

          return {
            text,
            sentiment,
            publishedAt,
            maskedUsername: `User_${Math.random().toString(36).substr(2, 9)}`,
          };
        } catch (error) {
          console.error(`Error analyzing comment: "${text}". Error:`, error);
          results.neutral++; // Default to neutral if there's an error
          return {
            text,
            sentiment: 'neutral',
            publishedAt,
            maskedUsername: `User_${Math.random().toString(36).substr(2, 9)}`,
          };
        }
      })
    );

    const client = await clientPromise;
    const db = client.db('youtube-analyzer');
    await db.collection('analyses').insertOne({
      videoId,
      analyzedAt: new Date(),
      comments: analyzedComments,
      results,
    });

    return { success: true, results };
  } catch (error: any) {
    console.error('Error analyzing comments:', error);
    return { success: false, error: error.message };
  }
}