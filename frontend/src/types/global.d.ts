declare global {
  interface Window {
    dataLogCallback?: (logData: any) => void;
  }
}

export {};
