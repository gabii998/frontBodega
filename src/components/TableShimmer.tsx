import TableShimmerProps from '../model/TableShimmerProps';

const TableShimmer = ({ rows = 5, columns }: TableShimmerProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      <div className="min-w-full">
        <div className="bg-gray-100">
          <div className="flex">
            {columns.map((width, i) => (
              <div
                key={i}
                className="px-6 py-3"
                style={{ width: `${width}%` }}
              >
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex border-t border-gray-200">
              {columns.map((width, colIndex) => (
                <div
                  key={colIndex}
                  className="px-6 py-4"
                  style={{ width: `${width}%` }}
                >
                  <div 
                    className="h-4 bg-gray-100 rounded"
                    style={{ 
                      width: `${Math.floor(Math.random() * 40) + 60}%`
                    }}
                  ></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableShimmer;