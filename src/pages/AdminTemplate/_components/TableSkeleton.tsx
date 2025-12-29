
interface Props {
  rows?: number; 
  cols?: number; 
}

export default function TableSkeleton({ rows = 5, cols = 4 }: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className="animate-pulse bg-[#1a1a1a]/50 border-b border-white/5"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              {colIndex === 0 ? (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                    <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="h-4 w-full bg-white/10 rounded"></div>
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
