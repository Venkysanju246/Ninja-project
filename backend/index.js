const express = require("express")
const app = express()
const path = require("path")
const apiKey = "csAuHJH6gDN0lky/JKCCvw==dNu9a0GPs8LG06qw"
const cors = require("cors")
const Redis = require("ioredis");
const redis = new Redis();
app.use(cors())
// const domain = require("./frontend/check")


const options = {
    method:"GET",
    headers:{
        "X-Api-Key":apiKey
    }
}

app.get("/details", async(req, res)=>{
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        const requests =   await redis.incr(ip)
          let ttl;
          if(requests==1){
              ttl = await redis.expire(ip, 60)
          }else {
             ttl =  await redis.ttl(ip)
          }
          if(requests > 5){
              return res.status(429).send({
                  msg:"Too many Request, please try again later !!",
                  ttl
              })
          }
          const webUrl = req.query.webUrl
           const response =await fetch(`https://api.api-ninjas.com/v1/whois?domain=${webUrl}`, options)
             const data = await response.json()
             await redis.set(webUrl, data)
             res.send({
              "whois":data
             })
    } catch (error) {
        res.send(400).send({
            msg:error.message
        })
    }
   
})

app.listen(3000, ()=>{
    console.log("server is running")
})