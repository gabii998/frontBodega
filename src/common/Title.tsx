interface TitleProps {
    title:string
}

const Title = ({ title }:TitleProps) => {
    return <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
}

export default Title;