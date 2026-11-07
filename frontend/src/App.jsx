import { useState } from 'react'
import './App.css'
import fetchJson from './fetchJson.js'

function App() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || file.length === 0) return

    setLoading(true)
    setData(null)

    try {
      const response = await fetchJson(file)
      setData(response)
    } catch (error) {
      console.error("Error fetching summary:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'low': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  return (
    <div className="w-full h-100 font-sans bg-[#f1f5f9] flex flex-col">
      <div className="bg-[#1e293b] h-[25vh] flex items-center justify-center px-[5vw] h-100">
        <h1 className="text-[#10b981] font-bold tracking-tight text-[clamp(5rem,12vw,10rem)]">
          Compressify
        </h1>
      </div>

      {!data && !loading &&
      <>
       <div className="flex-1 flex flex-col justify-center px-[8vw] py-[6vh]">
        <h2 className="text-[#3b82f6] font-bold leading-[1.15] tracking-tight mb-[3vh] text-[clamp(3rem,7vw,6rem)] max-w-[85vw]">
          Ever struggled with reading complex, long documents?
        </h2>

        <p className="text-[#334155] font-normal leading-relaxed text-[clamp(1.5rem,3.2vw,2.75rem)] max-w-[80vw]">
          Meet summify: An AI-powered summariser that makes pages long documents into easy-to-digest paragraph and a to-do-list with the actions you must take.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-[#f1f5f9] px-[8vw] py-[6vh] text-center">
        <h3 className="text-[#3b82f6] font-bold tracking-wider mb-[4vh] text-[clamp(3rem,7vw,6rem)] uppercase">
          Try Now
        </h3>

        <label className="flex flex-col md:flex-row items-center justify-center bg-white border-2 border-dashed border-slate-300 hover:border-[#3b82f6] rounded-[2vw] p-[4vw] cursor-pointer transition-colors max-w-[70vw] gap-[3vw]">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={loading}
          />
          
          <svg 
            className="w-[clamp(3rem,8vw,6rem)] h-[clamp(3rem,8vw,6rem)] text-black stroke-[2.5]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>

          <span className="text-[#22252a] font-bold text-left text-[clamp(1.125rem,2.5vw,2rem)] leading-snug max-w-[40vw]">
            {loading ? "Processing documents..." : "Upload image(s) of your document to get it broken down"}
          </span>
        </label>
      </div></>
      }

      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-[10vh] bg-white border-t border-slate-200">
          <p className="text-slate-600 text-[clamp(1.25rem,3vw,2rem)] font-medium ">Analyzing document text...</p>
        </div>
      )}

      {data && (
        <div className="bg-white border-t border-slate-200 px-[8vw] py-[8vh] flex flex-col gap-[6vh]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
            <h4 className="text-[#22252a] font-bold text-[clamp(2rem,5vw,4rem)]">Analysis Results</h4>
            <div className={`px-6 py-2 text-[clamp(1rem,2vw,1.75rem)] font-bold tracking-wide uppercase self-start md:self-auto ${getUrgencyColor(data.urgencyLevel)}`}>
              {data.urgencyLevel} Urgency
            </div>
          </div>

          <div className="flex flex-col gap-[2vh]">
            <h5 className="text-[#3b82f6] font-bold text-[clamp(1.5rem,3.5vw,2.5rem)]">Quick Summary</h5>
            <p className="text-[#334155] text-[clamp(1.25rem,2.8vw,2rem)] leading-relaxed bg-slate-50 p-[3vw] rounded-[1vw] border border-slate-100">
              {data.simplifiedSummary}
            </p>
          </div>

          <div className="flex flex-col gap-[2vh]">
            <h5 className="text-[#3b82f6] font-bold text-[clamp(1.5rem,3.5vw,2.5rem)]">Full Summary</h5>
            <div className="text-[#334155] text-[clamp(1.25rem,2.8vw,2rem)] leading-relaxed whitespace-pre-line bg-slate-50 p-[3vw] rounded-[1vw] border border-slate-100">
              {data.fullSummary}
            </div>
          </div>

          {data.actionItems && data.actionItems.length > 0 && (
            <div className="flex flex-col gap-[2vh]">
              <h5 className="text-red-500 font-bold text-[clamp(1.5rem,3.5vw,2.5rem)]">Required Actions</h5>
              <ul className="flex flex-col gap-[1.5vh]">
                {data.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-4 bg-red-50/50 p-[2vw] text-[#334155] text-[clamp(1.25rem,2.5vw,1.85rem)]">
                    <span className="font-medium pt-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.keyTermsDefined && data.keyTermsDefined.length > 0 && (
            <div className="flex flex-col gap-[2vh]">
              <h5 className="text-[#228B22] font-bold text-[clamp(1.5rem,3.5vw,2.5rem)]">Keywords explained</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[3vw]">
                {data.keyTermsDefined.map((item, index) => (
                  <div key={index} className="bg-green-50/30 p-[3vw] flex flex-col gap-2">
                    <span className="text-green font-bold text-[clamp(1.25rem,2.5vw,1.85rem)] italic">
                      {item.term}
                    </span>
                    <p className="text-green text-[clamp(1.125rem,2.2vw,1.65rem)] leading-normal">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
