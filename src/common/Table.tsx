
interface TableProps<T> {
    header: string[],
    emptyMessage: () => React.ReactNode,
    data: T[],
    content: (entity: T, index: number) => React.ReactNode[],
    rowClick?: (entity: T) => void
}

const Table = <T,>({ header, emptyMessage, data, content, rowClick = () => { } }: TableProps<T>) => {
    return <table className="min-w-full">
        <thead>
            <tr className="bg-gray-50">
                {header.map((h, index) => {
                    const alignmentClass =
                        index === 0
                            ? 'text-left'
                            : index === header.length - 1
                                ? 'text-right'
                                : 'text-center';

                    return (
                        <th
                            key={index}
                            className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${alignmentClass}`}
                        >
                            {h}
                        </th>
                    );
                })}
            </tr>

        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {data.length == 0 ? (
                <tr>
                    <td colSpan={header.length} className="px-6 py-4 text-center text-gray-500">
                        {emptyMessage()}
                    </td>
                </tr>
            ) : (
                data.map((entity, index) => {
                    return <tr key={index} className="hover:bg-gray-50" onClick={() => rowClick(entity)}>
                        {content(entity, index).map((td, index) => {
                            return (<td key={index} className="px-6 py-4 whitespace-nowrap">
                                {td}
                            </td>)
                        })}
                    </tr>
                })
            )}
        </tbody>
    </table>
}

export default Table;