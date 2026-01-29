from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import socket

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "message": "🚀 Backend is Live!",
        "status": "running",
        "version": "1.0",
        "timestamp": datetime.now().isoformat(),
        "hostname": socket.gethostname(),
        "deployed_from": "Jenkins on Windows"
    })

@app.route('/api/users')
def get_users():
    users = [
        {"id": 1, "name": "Abhishek Kumar", "role": "DevOps Engineer"},
        {"id": 2, "name": "Rohit Sharma", "role": "Backend Developer"},
        {"id": 3, "name": "Priya Singh", "role": "Frontend Developer"},
        {"id": 4, "name": "Amit Verma", "role": "QA Engineer"}
    ]
    return jsonify({"users": users, "count": len(users)})

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "service": "backend-api",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/deployment')
def deployment_info():
    return jsonify({
        "ci_cd": "Jenkins on Windows",
        "container": "Docker",
        "orchestration": "Kubernetes on Ubuntu VM",
        "registry": "DockerHub"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)