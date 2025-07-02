import { Edit, Trash2 } from "lucide-react"

const EditIcon = ({onClick,label}:{onClick:() => void,label:string}) => {
    return (<button
        onClick={onClick}
        className="edit-button"
        title={label}>
        <Edit className="h-5 w-5" />
    </button>)
}

const DeleteIcon = ({onClick,label}:{onClick:() => void,label:string}) => {
    return (
        <button
            onClick={onClick}
            className="delete-button"
            title={label}>
            <Trash2 className="h-5 w-5" />
        </button>
    )
}

export {EditIcon,DeleteIcon};