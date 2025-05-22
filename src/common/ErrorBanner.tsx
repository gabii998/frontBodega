interface ErrorBannerProps {
    error:string,
    retry?:() => void
}
const ErrorBanner = ({error,retry = () => {}}:ErrorBannerProps) => {
    return(
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={retry}
            className="ml-2 text-red-700 font-semibold hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
    )
}
export default ErrorBanner;