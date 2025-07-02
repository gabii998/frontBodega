import { ArrowLeft, Plus } from "lucide-react";
import Title from "./Title";

const TableTitle = ({ handleBack, onAddWorkday, title, showBack = false }: { handleBack: () => void, onAddWorkday: () => void, title: string, showBack?: boolean }) => {
    return (<div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            {showBack && <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800"
            >
                <ArrowLeft className="h-6 w-6" />
            </button>}
            <div>
                <Title title={title} />
            </div>
        </div>
        <button
            onClick={() => onAddWorkday()}
            className="toolbar-button"
        >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Jornal
        </button>
    </div>)
}

export default TableTitle;