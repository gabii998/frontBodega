import axios from "axios";

interface ApiCallProps<T> {
    setError: (error: string | null) => void,
    setLoading?: ((show: boolean) => void) | null,
    onSuccess: (data: T) => void,
    serverCall: Promise<T>,
    errorMessage?: string | null
}

export const apiCall = async <T>({
    setError,
    setLoading,
    onSuccess,
    serverCall,
    errorMessage
}:ApiCallProps<T>) => {
    if (setLoading != null) {
        setLoading(true);
    }
    setError(null);
    try {
        const data = await serverCall;

        onSuccess(data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                if(errorMessage) {
                    setError(errorMessage);
                }
            }
        } else if (error instanceof Error) {
            setError(error.message);
        } else {
            if(errorMessage) {
                setError(errorMessage);
            }
        }
    } finally {
        if (setLoading != null) {
            setLoading(false);
        }
    }
}