
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay, CelebrityResultDisplay, SoulmateResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeFace, findCelebrityLookAlike, findSoulmate } from './services/geminiService';
import { SparklesIcon, StarIcon, FaceSmileIcon as PhysiognomyIcon, HeartIcon } from './components/IconComponents';

type Feature = 'physiognomy' | 'celebrity' | 'soulmate';

// Interfaces for structured data from Gemini API
interface CelebrityResult {
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

interface SoulmateResult {
    celebrityName: string;
    matchScore: number;
    analysis: {
        overall: string;
        compatibilityPoints: string[];
    };
    advice: string;
}

const App: React.FC = () => {
    // Shared State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeFeature, setActiveFeature] = useState<Feature>('physiognomy');

    // Physiognomy State
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoadingPhysiognomy, setIsLoadingPhysiognomy] = useState<boolean>(false);
    const [errorPhysiognomy, setErrorPhysiognomy] = useState<string | null>(null);

    // Celebrity Match State
    const [celebrityResult, setCelebrityResult] = useState<CelebrityResult | null>(null);
    const [isLoadingCelebrity, setIsLoadingCelebrity] = useState<boolean>(false);
    const [errorCelebrity, setErrorCelebrity] = useState<string | null>(null);

    // Soulmate Match State
    const [soulmateResult, setSoulmateResult] = useState<SoulmateResult | null>(null);
    const [isLoadingSoulmate, setIsLoadingSoulmate] = useState<boolean>(false);
    const [errorSoulmate, setErrorSoulmate] = useState<string | null>(null);


    const handleImageSelect = (file: File | null) => {
        // Reset all states when a new image is selected
        setAnalysis(null);
        setErrorPhysiognomy(null);
        setCelebrityResult(null);
        setErrorCelebrity(null);
        setSoulmateResult(null);
        setErrorSoulmate(null);
        setImageFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    };
    
    const handleFeatureChange = (feature: Feature) => {
        setActiveFeature(feature);
    }

    const handlePhysiognomyAnalysis = useCallback(async () => {
        if (!imageFile) {
            setErrorPhysiognomy("먼저 사진을 업로드해주세요.");
            return;
        }
        setIsLoadingPhysiognomy(true);
        setErrorPhysiognomy(null);
        setAnalysis(null);
        try {
            const result = await analyzeFace(imageFile);
            setAnalysis(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
            setErrorPhysiognomy(errorMessage);
        } finally {
            setIsLoadingPhysiognomy(false);
        }
    }, [imageFile]);

    const handleCelebrityAnalysis = useCallback(async () => {
        if (!imageFile) {
            setErrorCelebrity("먼저 사진을 업로드해주세요.");
            return;
        }
        setIsLoadingCelebrity(true);
        setErrorCelebrity(null);
        setCelebrityResult(null);
        try {
            const result = await findCelebrityLookAlike(imageFile);
            setCelebrityResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
            setErrorCelebrity(errorMessage);
        } finally {
            setIsLoadingCelebrity(false);
        }
    }, [imageFile]);

    const handleSoulmateAnalysis = useCallback(async () => {
        if (!imageFile) {
            setErrorSoulmate("먼저 사진을 업로드해주세요.");
            return;
        }
        setIsLoadingSoulmate(true);
        setErrorSoulmate(null);
        setSoulmateResult(null);
        try {
            const result = await findSoulmate(imageFile);
            setSoulmateResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
            setErrorSoulmate(errorMessage);
        } finally {
            setIsLoadingSoulmate(false);
        }
    }, [imageFile]);
    
    const analysisConfig = {
        physiognomy: {
            headerTitle: 'AI 관상 분석',
            headerSubtitle: '얼굴 사진으로 당신의 성격과 운명을 알아보세요',
            handler: handlePhysiognomyAnalysis,
            isLoading: isLoadingPhysiognomy,
            buttonText: 'AI 관상 분석',
            buttonIcon: <SparklesIcon className="w-5 h-5 mr-2" />,
            error: errorPhysiognomy,
            result: analysis,
            ResultComponent: <ResultDisplay result={analysis!} />,
            placeholder: {
                title: 'AI 관상가에게 당신의 미래를 물어보세요.',
                subtitle: '사진을 올리고 분석을 시작하세요.'
            }
        },
        celebrity: {
            headerTitle: '닮은꼴 연예인 찾기',
            headerSubtitle: '나와 가장 닮은 연예인은 누구일까요?',
            handler: handleCelebrityAnalysis,
            isLoading: isLoadingCelebrity,
            buttonText: '닮은 연예인 찾기',
            buttonIcon: <StarIcon className="w-5 h-5 mr-2" />,
            error: errorCelebrity,
            result: celebrityResult,
            ResultComponent: <CelebrityResultDisplay result={celebrityResult!} />,
            placeholder: {
                title: '가장 닮은 연예인을 찾아보세요!',
                subtitle: '사진을 올리고 분석을 시작하세요.'
            }
        },
        soulmate: {
            headerTitle: '천생연분 찾기',
            headerSubtitle: '관상으로 내 운명의 짝을 찾아보세요',
            handler: handleSoulmateAnalysis,
            isLoading: isLoadingSoulmate,
            buttonText: '천생연분 찾기',
            buttonIcon: <HeartIcon className="w-5 h-5 mr-2" />,
            error: errorSoulmate,
            result: soulmateResult,
            ResultComponent: <SoulmateResultDisplay result={soulmateResult!} />,
            placeholder: {
                title: '당신의 천생연분은 누구일까요?',
                subtitle: '사진을 올리고 운명의 상대를 찾아보세요.'
            }
        },
    };

    const currentConfig = analysisConfig[activeFeature];

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <Header title={currentConfig.headerTitle} subtitle={currentConfig.headerSubtitle} />
            
            <div className="w-full max-w-xl mx-auto my-8">
                <div className="grid grid-cols-3 bg-gray-800 rounded-xl p-1 shadow-inner gap-1">
                    <button
                        onClick={() => handleFeatureChange('physiognomy')}
                        className={`w-full flex items-center justify-center space-x-2 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ${activeFeature === 'physiognomy' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
                        aria-pressed={activeFeature === 'physiognomy'}
                    >
                        <PhysiognomyIcon className="w-5 h-5" />
                        <span>AI 관상</span>
                    </button>
                    <button
                        onClick={() => handleFeatureChange('celebrity')}
                        className={`w-full flex items-center justify-center space-x-2 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ${activeFeature === 'celebrity' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
                        aria-pressed={activeFeature === 'celebrity'}
                    >
                        <StarIcon className="w-5 h-5" />
                        <span>닮은꼴 찾기</span>
                    </button>
                    <button
                        onClick={() => handleFeatureChange('soulmate')}
                        className={`w-full flex items-center justify-center space-x-2 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ${activeFeature === 'soulmate' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
                        aria-pressed={activeFeature === 'soulmate'}
                    >
                        <HeartIcon className="w-5 h-5" />
                        <span>천생연분</span>
                    </button>
                </div>
            </div>

            <main className="w-full max-w-6xl mx-auto flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col space-y-6">
                        <h2 className="text-2xl font-bold text-center text-indigo-400">1. 사진 업로드</h2>
                        <ImageUploader onImageSelect={handleImageSelect} previewUrl={previewUrl} />
                        {previewUrl && (
                             <button
                                onClick={currentConfig.handler}
                                disabled={currentConfig.isLoading}
                                className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                {currentConfig.isLoading ? (
                                    <>
                                        <LoadingSpinner />
                                        <span className="ml-2">분석 중...</span>
                                    </>
                                ) : (
                                    <>
                                        {currentConfig.buttonIcon}
                                        <span>{currentConfig.buttonText}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col space-y-6">
                        <h2 className="text-2xl font-bold text-center text-green-400">2. 분석 결과</h2>
                         <div className="bg-gray-800 rounded-xl p-6 min-h-[400px] shadow-2xl border border-gray-700 flex items-center justify-center">
                             {currentConfig.isLoading ? (
                                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                     <LoadingSpinner />
                                     <p className="mt-4 text-lg">AI가 당신의 얼굴을 분석하고 있습니다...</p>
                                     <p className="text-sm">잠시만 기다려주세요.</p>
                                 </div>
                             ) : (
                                 <>
                                     {currentConfig.error && <div className="text-red-400 text-center"><p>{currentConfig.error}</p></div>}
                                     {currentConfig.result && currentConfig.ResultComponent}
                                     {!currentConfig.error && !currentConfig.result && (
                                         <div className="text-gray-500 text-center">
                                             <p className="text-lg">{currentConfig.placeholder.title}</p>
                                             <p>{currentConfig.placeholder.subtitle}</p>
                                         </div>
                                     )}
                                 </>
                             )}
                         </div>
                    </div>
                </div>
            </main>
            <footer className="w-full max-w-6xl mx-auto text-center py-6 mt-8 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} AI Physiognomy Reader. For Entertainment Purposes Only.</p>
            </footer>
        </div>
    );
};

export default App;
