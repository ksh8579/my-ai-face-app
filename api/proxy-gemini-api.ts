import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// Vercel 환경 변수에서 API 키를 안전하게 가져옵니다.
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  throw new Error("Google API key is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// 요청 본문의 타입을 정의합니다.
interface RequestBody {
  image: string; // base64 encoded image
  mimeType: string;
  feature: 'physiognomy' | 'celebrity' | 'soulmate';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 웹 브라우저의 사전 요청(preflight)을 처리하기 위한 부분입니다.
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { image, mimeType, feature } = req.body as RequestBody;

        const imagePart = {
            inlineData: {
                data: image,
                mimeType: mimeType,
            },
        };
        
        // 얼굴 감지
        const faceDetectionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{text: "Is there a human face in this image? Answer with only 'Yes' or 'No'."}, imagePart]},
            config: { temperature: 0, maxOutputTokens: 5, thinkingConfig: { thinkingBudget: 0 } },
        });

        if (!faceDetectionResponse.text.trim().toLowerCase().startsWith('yes')) {
            return res.status(400).json({ error: "사진에서 얼굴을 찾을 수 없습니다. 정면이 보이는 사람 얼굴 사진으로 다시 시도해주세요." });
        }
        
        let result;

        switch (feature) {
            case 'physiognomy':
                const physioPrompt = `
                    당신은 수십 년 경력의 숙련된 관상가입니다. 제공된 얼굴 사진을 분석하여 관상학적 관점에서 자세히 풀이해주세요. 
                    결과는 반드시 다음 Markdown 구조를 사용하여 분석해주세요:

                    **총평**
                    - 얼굴 전체에서 느껴지는 기운과 전반적인 운세의 흐름을 2~3문장으로 요약합니다.

                    **얼굴 각 부위별 분석**
                    * **이마 (초년운)**: 넓이, 모양, 빛깔을 보고 지혜, 직업운, 부모운을 분석합니다.
                    * **눈썹 (형제운, 계획)**: 모양, 짙음, 길이를 보고 대인관계와 계획성을 분석합니다.
                    * **눈 (중년운의 핵심)**: 눈빛, 크기, 모양을 보고 마음의 상태, 재물운, 지혜를 분석합니다.
                    * **코 (재물운)**: 콧대의 높이, 콧방울의 모양을 보고 재물운과 자존심을 분석합니다.
                    * **인중과 입 (말년운)**: 인중의 길이와 깊이, 입의 크기와 입꼬리를 보고 자녀운, 의지력, 말년의 생활을 분석합니다.
                    * **턱 (말년운, 부동산운)**: 턱의 모양과 살집을 보고 의지력, 아랫사람 복, 안정적인 말년을 분석합니다.

                    **성격 및 기질**
                    - 분석을 종합하여 어떤 성격과 기질을 가졌는지 설명합니다.

                    **조언**
                    - 관상학적 단점을 보완하고 장점을 극대화할 수 있는 삶의 태도나 방법에 대해 조언합니다.

                    분석 내용은 친절하고 이해하기 쉬운 말투로 작성해주세요.
                    마지막에는 다음 문구를 반드시 포함해주세요: 
                    "면책 조항: 이 분석은 오락적인 목적으로 제공되며, 과학적 근거가 부족할 수 있습니다. 인생의 중요한 결정은 본인의 판단에 따라 신중하게 내리시기 바랍니다."
                `;
                const physioResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [{text: physioPrompt}, imagePart]}
                });
                result = physioResponse.text;
                break;

            case 'celebrity':
                const celebPrompt = `당신은 얼굴 인식 및 연예인 전문가입니다. 주어진 사진의 얼굴을 분석해서, 가장 닮은 한국 연예인이 누구인지 찾아주세요. 응답은 오직 JSON 형식으로만 생성해야 합니다. 분석 결과를 상세하게 제공해주세요.`;
                const celebResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [{text: celebPrompt}, imagePart] },
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                celebrityName: { type: Type.STRING },
                                similarityScore: { type: Type.NUMBER },
                                analysis: {
                                    type: Type.OBJECT,
                                    properties: {
                                        overallImpression: { type: Type.STRING },
                                        facialFeatures: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: { feature: { type: Type.STRING }, description: { type: Type.STRING } },
                                                required: ['feature', 'description']
                                            }
                                        }
                                    },
                                    required: ['overallImpression', 'facialFeatures']
                                }
                            },
                            required: ['celebrityName', 'similarityScore', 'analysis'],
                        },
                    }
                });
                result = JSON.parse(celebResponse.text.trim());
                break;

            case 'soulmate':
                const genderDetectionResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [{text: "Is the person in this image male or female? Answer with only 'male' or 'female'."}, imagePart]},
                    config: { temperature: 0, maxOutputTokens: 5, thinkingConfig: { thinkingBudget: 0 } },
                });
                const gender = genderDetectionResponse.text.trim().toLowerCase().includes('male') ? '남성' : '여성';
                const soulmateGender = gender === '남성' ? '여성' : '남성';

                const soulmatePrompt = `당신은 연애 컨설턴트이자 관상 전문가입니다. 주어진 사진의 얼굴은 '${gender}'입니다. 이 사람의 관상을 분석하여, 결혼 상대로 가장 잘 어울리는 한국 '${soulmateGender}' 연예인 한 명을 추천해주세요. 응답은 반드시 JSON 형식이어야 합니다. 분석은 상세하고 긍정적인 내용으로 구성해주세요.`;
                const soulmateResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [{text: soulmatePrompt}, imagePart] },
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                celebrityName: { type: Type.STRING },
                                matchScore: { type: Type.NUMBER },
                                analysis: {
                                    type: Type.OBJECT,
                                    properties: {
                                        overall: { type: Type.STRING },
                                        compatibilityPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ['overall', 'compatibilityPoints']
                                },
                                advice: { type: Type.STRING }
                            },
                            required: ['celebrityName', 'matchScore', 'analysis', 'advice'],
                        }
                    }
                });
                result = JSON.parse(soulmateResponse.text.trim());
                break;

            default:
                throw new Error('Invalid feature specified.');
        }

        // 성공 응답을 클라이언트에게 보냅니다.
        return res.status(200).json(result);

    } catch (error) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        // 에러 응답을 클라이언트에게 보냅니다.
        return res.status(500).json({ error: `AI 서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (${errorMessage})` });
    }
}
