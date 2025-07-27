// Generic interface for better type safety, should match component types
export interface CelebrityResult {
    celebrityName: string;
    similarityScore: number;
    analysis: {
        facialFeatures: {
            feature: string;
            description: string;
        }[];
        overallImpression: string;
    };
}

export interface SoulmateResult {
    celebrityName: string;
    matchScore: number;
    analysis: {
        overall: string;
        compatibilityPoints: string[];
    };
    advice: string;
}

/**
 * A utility function to convert a File object to a base64 string.
 * @param file The file to convert.
 * @returns A promise that resolves to the base64 encoded string.
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

/**
 * Calls our secure backend function to perform AI analysis.
 * @param imageFile The image file to analyze.
 * @param feature The type of analysis to perform.
 * @returns A promise that resolves to the analysis result.
 */
const callSecureApi = async <T>(imageFile: File, feature: 'physiognomy' | 'celebrity' | 'soulmate'): Promise<T> => {
    try {
        const imageBase64 = await fileToBase64(imageFile);

        const response = await fetch('/api/proxy-gemini-api', { // <-- 경로가 Vercel에 맞게 변경되었습니다.
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageBase64,
                mimeType: imageFile.type,
                feature: feature,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `서버 오류가 발생했습니다: ${response.statusText}`);
        }

        const result = await response.json();
        return result as T;

    } catch (error) {
        console.error(`Error during ${feature} analysis:`, error);
        if (error instanceof Error) {
            // Re-throw the error with a user-friendly message
            throw new Error(`분석 중 오류가 발생했습니다: ${error.message}`);
        }
        throw new Error('알 수 없는 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
    }
};

export const analyzeFace = (imageFile: File): Promise<string> => {
    return callSecureApi<string>(imageFile, 'physiognomy');
};

export const findCelebrityLookAlike = (imageFile: File): Promise<CelebrityResult> => {
    return callSecureApi<CelebrityResult>(imageFile, 'celebrity');
};

export const findSoulmate = (imageFile: File): Promise<SoulmateResult> => {
    return callSecureApi<SoulmateResult>(imageFile, 'soulmate');
};