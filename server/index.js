import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'

const app = express()

app.use(cors({
    origin: `${process.env.VITE_FE_URL}`,
    credentials: true
}));app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get("/", (req, res) => {
    res.json("hello")
})


app.listen(process.env.PORT, () => {
    console.log(`Server is listening on PORT: ${process.env.PORT} `)
})
