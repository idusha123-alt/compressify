import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Groq from 'groq-sdk'
import sharp from 'sharp'
import multer from 'multer'

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const apiKey = process.env.API_KEY
const port = process.env.PORT

const groqClient = new Groq({
  apiKey: apiKey,
})

app.use(express.static('public'))
app.use(cors())
app.use(express.json())

const prompt = `You are an elite legal, corporate, and technical analyst AI. Your task is to read highly complex documents and extract their contents with 100% accuracy. Missing a single obligation, deadline, liability, or hidden clause is unacceptable and could have severe legal consequences.

Instructions:
1. Thoroughly read the provided document.
2. Analyze every section, clause, and footnote. Identify all obligations, risks, deadlines, and financial figures.
3. You must output your final analysis strictly as a valid JSON object. Do not include any introductory text, concluding remarks, or markdown formatting outside of the JSON itself.
4. Adhere strictly to the JSON schema provided below.

JSON Schema & Field Guidelines:
Your output must exactly match this JSON structure:

{
  "simplifiedSummary": "A 2-3 sentence extremely simple explanation of what this document means (written at an 8th-grade reading level).",
  "fullSummary": "Comprehensive bulleted format. You must cover ALL topics, clauses, liabilities, and obligations in the document. Do not summarize away important legal nuances.",
  "urgencyLevel": "Must strictly be 'High', 'Medium', or 'Low'. (High = immediate deadlines, severe liabilities, or critical actions needed. Medium = standard actions required soon. Low = informational or no immediate action).",
  "actionItems": [
    "Start with an imperative verb (e.g., 'Sign page 4', 'Pay $500 by Friday').",
    "List every specific action required by the reader."
  ],
  "keyTermsDefined": [
    { 
      "term": "Exact jargon word or legal phrase", 
      "definition": "Simple, plain-English definition in the context of this document" 
    }
  ]
}

Formatting Rules:
- Ensure the fullSummary field uses standard string text with newline characters (\\n) and bullet points (e.g., - or •) to separate points.
- Ensure the JSON is properly escaped so it does not break when parsed.
- The urgencyLevel must be exactly one of the three specified words, case-sensitive.
`

const processImageBuffer = async (buffer) => {
    const optimizedBuffer = await sharp(buffer).resize(1120, 1120, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer()

    const base64Data = optimizedBuffer.toString('base64')
    return `data:image/jpeg;base64,${base64Data}`
}

const analyzeDocument = async (base64ImageURL) => {
    try {
        const sizeInKB = (Buffer.byteLength(base64ImageURL, 'utf8') / 1024).toFixed(2)
        const startTime = Date.now()

        const response = await groqClient.chat.completions.create({
            model: "qwen/qwen3.8-27b", 
            messages: [
                { 
                    role: "user", 
                    content: [
                        { type: "text", text: `${prompt}\n\nPlease analyze this document image and respond ONLY with the valid JSON object.` },
                        {
                            type: "image_url",
                            image_url: { url: base64ImageURL }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 1000,
        })


        let rawContent = response.choices[0]?.message?.content || ''
        rawContent = rawContent.trim()
        
        const firstBrace = rawContent.indexOf('{')
        const lastBrace = rawContent.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1) {
            rawContent = rawContent.substring(firstBrace, lastBrace + 1)
        }

        return JSON.parse(rawContent)
    }
    catch(e) {
        console.error("\nError in analyzeDocument:", e.message || e)
        throw e
    }
}

app.post('/api/analyze-image', upload.array('images'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Couldn't find any uploaded files, please try again!" })
    }
    try {
        const base64ImageURL = await processImageBuffer(req.files[0].buffer)
        const json = await analyzeDocument(base64ImageURL)
        res.status(200).json(json)
    } catch(e) {
        res.status(500).json({ error: e.message })
    }
})

app.listen(3000, () => {
    console.log(`App is running on port: ${port}`)
})
