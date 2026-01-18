declare module 'webgazer' {
  interface Prediction {
    x: number
    y: number
  }

  interface WebGazer {
    setRegression(regression: string): WebGazer
    showVideo(show: boolean): WebGazer
    showPredictionPoints(show: boolean): WebGazer
    showFaceOverlay(show: boolean): WebGazer
    begin(): Promise<void>
    pause(): WebGazer
    resume(): WebGazer
    end(): void
    getCurrentPrediction(): Prediction | null
    setGazeListener(listener: (data: Prediction | null, clock: number) => void): WebGazer
    clearGazeListener(): WebGazer
    params: {
      showVideo: boolean
      showFaceOverlay: boolean
      showPredictionPoints: boolean
    }
  }

  const webgazer: WebGazer
  export default webgazer
}
