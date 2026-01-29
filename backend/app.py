from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "message": "Hello from Backend!", 
        "status": "running",
        "version": "1.0"
    })

@app.route('/api/users')
def get_users():
    users = [
        {"id": 1, "name": "Abhishek", "role": "DevOps Engineer"},
        {"id": 2, "name": "Rohit", "role": "Developer"},
        {"id": 3, "name": "Priya", "role": "Tester"}
    ]
    return jsonify({"users": users, "count": len(users)})

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "service": "backend"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)