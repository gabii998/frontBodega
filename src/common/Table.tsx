
interface TableProps {
    header: string[],
    emptyMessage: string,
    isEmpty:boolean,
    content:() => React.ReactNode[]
}

const Table = ({ header, emptyMessage, isEmpty , content }: TableProps) => {
    return <table className="min-w-full">
        <thead>
            <tr className="bg-gray-50">
                {header.map((h,index) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {isEmpty ? (
                <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        {emptyMessage}
                    </td>
                </tr>
            ) : (
                content()
            )}
        </tbody>
    </table>
}

export default Table;