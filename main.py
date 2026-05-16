from flask import Flask,request,jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# 稳定可用网易云API
API_URL = "https://api.injahow.cn/meting/api"

@app.route('/api/<path:path>',methods=["GET","POST"])
def proxy(path):
    args = request.args
    data = request.form
    url = f"{API_URL}/{path}"
    if request.method=="GET":
        res = requests.get(url,params=args,timeout=10)
    else:
        res = requests.post(url,data=data,timeout=10)
    return jsonify(res.json())

@app.route("/")
def index():
    return open("index.html","r",encoding="utf-8")

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=8080,debug=False)
