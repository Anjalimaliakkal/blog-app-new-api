const Express = require("express")
const Mongoose = require("mongoose")
const Bcrypt = require("bcrypt")
const Cors = require("cors")
const jwt = require("jsonwebtoken")
const userModel = require("./models/users")

let app = Express()

app.use(Express.json())
app.use(Cors())

Mongoose.connect("mongodb+srv://anjali2003:anjali2003@cluster0.wy6js.mongodb.net/blogappnewdb?retryWrites=true&w=majority&appName=Cluster0")

//create a post

app.post("/create", async (req, res) => {
    let input = req.body

    let token = req.headers.token

    jwt.verify(token, "blogApp", async (error, decoded) => {
        if (decoded && decoded.email) {
            let result = new postModel(input)
            await result.save()
            res.json({ "status": "success" })

        } else {
            res.json({ "status": "invalid Authentication" })
        }
    })

})

//sign in
app.post("/signin", async (req, res) => {

    let input = req.body
    let result = userModel.find({ email: req.body.email }).then(
        (items) => {
            if (items.length > 0) {
                const passwordValidator = Bcrypt.compareSync(req.body.password, items[0].password)
                if (passwordValidator) {

                    jwt.sign({ email: req.body.email }, "blogApp", { expiresIn: "1d" },
                        (error, token) => {
                            if (error) {
                                res.json({ "status": "error", "errorMessage": error })
                            } else {
                                res.json({ "status": "success", "token": token, "userId": items[0]._id })
                            }
                        })
                } else {
                    res.json({ "status": "incorrect password" })
                }
            } else {
                res.json({ "status": "invalid email id" })
            }
        }
    ).catch()
})


//sign up
app.post("/signup", async (req, res) => {
    let input = req.body
    let hashedPassword = Bcrypt.hashSync(req.body.password, 10)
    console.log(hashedPassword)
    req.body.password = hashedPassword

    userModel.find({ email: req.body.email }).then(
        (items) => {

            if (items.length > 0) {

                res.json({ "status": "email id already exist" })

            } else {

                let result = new userModel(input)
                result.save()
                res.json({ "status": "success" })
            }


        })
})

app.listen(8080, () => {
    console.log("server started")
})