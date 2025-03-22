from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os
import pandas as pd

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

app = Flask(
    __name__,
    template_folder=os.path.join(parent_dir, "templates"),
    static_folder=os.path.join(parent_dir, "static")
)

# Load model
model_path = os.path.join(parent_dir, "models", "RandomForest.pkl")
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Không tìm thấy mô hình tại {model_path}")
model = joblib.load(model_path)

# Health information and article links
health_info = {
    "gender": {
        "message": "Gender is an important factor in stroke risk assessment. Some studies suggest different risk profiles for men and women.",
        "link": "https://www.stroke.org/en/about-stroke/stroke-risk-factors/women-have-a-higher-risk-of-stroke"
    },
    "age": {
        "message": "Stroke risk increases with age. If you're over 55, your risk is significantly higher.",
        "link": "https://www.stroke.org/en/about-stroke/stroke-risk-factors/stroke-risk-factors-not-within-your-control"
    },
    "hypertension": {
        "message": "Hypertension (high blood pressure) is a major risk factor for stroke. Regular monitoring and management are crucial.",
        "link": "https://www.stroke.org/en/about-stroke/stroke-risk-factors/high-blood-pressure-and-stroke"
    },
    "heart_disease": {
        "message": "Heart disease can significantly increase stroke risk. Regular cardiac check-ups are recommended.",
        "link": "https://www.stroke.org/en/about-stroke/stroke-risk-factors/risk-factors-under-your-control"
    },
    "avg_glucose_level": {
        "message": "High blood glucose levels can damage blood vessels over time, increasing stroke risk.",
        "link": "https://www.stroke.org/en/about-stroke/stroke-risk-factors/diabetes-and-stroke-prevention"
    },
    "bmi": {
        "message": "A BMI outside the healthy range (18.5-24.9) may increase risk of various health conditions including stroke.",
        "link": "https://www.stroke.org/en/healthy-living/healthy-eating/healthy-weight"
    },
    "smoking_status": {
        "message": "Smoking increases stroke risk by damaging blood vessels and promoting clot formation.",
        "link": "https://www.stroke.org/en/healthy-living/healthy-lifestyle/quit-smoking"
    }
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data_input = request.get_json() if request.is_json else request.form
        feedback = []  # List to store feedback messages with article links

        # Lấy dữ liệu đầu vào
        gender = str(data_input.get("gender", "")).strip().lower()
        age = str(data_input.get("age", "")).strip()
        hypertension = str(data_input.get("hypertension", "")).strip()
        heart_disease = str(data_input.get("heart_disease", "")).strip()
        ever_married = str(data_input.get("ever_married", "")).strip().lower()
        work_type = str(data_input.get("work_type", "")).strip().lower()
        residence_type = str(data_input.get("Residence_type", "")).strip().lower()
        avg_glucose_level = str(data_input.get("avg_glucose_level", "")).strip()
        bmi = str(data_input.get("bmi", "")).strip()
        smoking_status = str(data_input.get("smoking_status", "")).strip().lower()

        # Kiểm tra dữ liệu đầu vào
        if not all([gender, age, hypertension, heart_disease, ever_married, work_type, residence_type,
                    avg_glucose_level, bmi, smoking_status]):
            return jsonify({"error": "Thiếu dữ liệu đầu vào"}), 400

        # Chuyển dấu phẩy thành dấu chấm
        bmi = bmi.replace(',', '.')
        avg_glucose_level = avg_glucose_level.replace(',', '.')

        # Ép kiểu dữ liệu
        try:
            age = float(age)
            hypertension = int(hypertension)
            heart_disease = int(heart_disease)
            bmi = float(bmi)
            avg_glucose_level = float(avg_glucose_level)
        except ValueError:
            return jsonify({"error": "Dữ liệu nhập vào không hợp lệ"}), 400

        # Kiểm tra giá trị hợp lệ và thu thập feedback
        if gender not in ["male", "female", "other"]:
            return jsonify({"error": "Invalid gender value.", 
                            "info": health_info["gender"]}), 400
            
        if not (0 <= age <= 120):
            return jsonify({"error": "Invalid age value.", 
                            "info": health_info["age"]}), 400
        elif age > 55:
            feedback.append({
                "field": "age",
                "message": f"Age ({age}) is a significant risk factor for stroke.",
                "info": health_info["age"]
            })
            
        if hypertension not in [0, 1]:
            return jsonify({"error": "Invalid hypertension value.", 
                            "info": health_info["hypertension"]}), 400
        elif hypertension == 1:
            feedback.append({
                "field": "hypertension",
                "message": "Having hypertension significantly increases your stroke risk.",
                "info": health_info["hypertension"]
            })
            
        if heart_disease not in [0, 1]:
            return jsonify({"error": "Invalid heart disease value.", 
                            "info": health_info["heart_disease"]}), 400
        elif heart_disease == 1:
            feedback.append({
                "field": "heart_disease",
                "message": "Having heart disease significantly increases your stroke risk.",
                "info": health_info["heart_disease"]
            })
            
        if ever_married not in ["yes", "no"]:
            return jsonify({"error": "Invalid ever_married value."}), 400
            
        if work_type not in ["children", "private", "self-employed", "govt_job", "never_worked"]:
            return jsonify({"error": "Invalid work type value."}), 400
            
        if residence_type not in ["urban", "rural"]:
            return jsonify({"error": "Invalid residence type value."}), 400
            
        if not (50 <= avg_glucose_level <= 300):
            return jsonify({"error": "Invalid avg_glucose_level value.", 
                            "info": health_info["avg_glucose_level"]}), 400
        elif avg_glucose_level > 140:
            feedback.append({
                "field": "avg_glucose_level",
                "message": f"Your glucose level ({avg_glucose_level:.1f}) is high and may indicate diabetes or prediabetes.",
                "info": health_info["avg_glucose_level"]
            })
            
        if not (10 <= bmi <= 60):
            return jsonify({"error": "Invalid BMI value.", 
                            "info": health_info["bmi"]}), 400
        elif bmi < 18.5:
            feedback.append({
                "field": "bmi",
                "message": f"Your BMI ({bmi:.1f}) is below the healthy range (18.5-24.9).",
                "info": health_info["bmi"]
            })
        elif bmi >= 25 and bmi < 30:
            feedback.append({
                "field": "bmi",
                "message": f"Your BMI ({bmi:.1f}) indicates you are overweight. The healthy BMI range is 18.5-24.9.",
                "info": health_info["bmi"]
            })
        elif bmi >= 30:
            feedback.append({
                "field": "bmi",
                "message": f"Your BMI ({bmi:.1f}) indicates obesity, which is a risk factor for stroke.",
                "info": health_info["bmi"]
            })
            
        if smoking_status not in ["never smoked", "formerly smoked", "smokes", "unknown"]:
            return jsonify({"error": "Invalid smoking status value.", 
                            "info": health_info["smoking_status"]}), 400
        elif smoking_status == "smokes":
            feedback.append({
                "field": "smoking_status",
                "message": "Smoking is a major risk factor for stroke. Consider quitting for better health.",
                "info": health_info["smoking_status"]
            })
        elif smoking_status == "formerly smoked":
            feedback.append({
                "field": "smoking_status",
                "message": "Former smokers still have elevated stroke risk, though it decreases over time after quitting.",
                "info": health_info["smoking_status"]
            })

        # Chuyển đổi categorical features thành số
        gender_dict = {"male": 0, "female": 1, "other": 2}
        married_dict = {"no": 0, "yes": 1}
        work_dict = {"children": 0, "private": 1, "self-employed": 2, "govt_job": 3, "never_worked": 4}
        residence_dict = {"urban": 0, "rural": 1}
        smoking_dict = {"never smoked": 0, "formerly smoked": 1, "smokes": 2, "unknown": 3}

        gender_encoded = gender_dict[gender]
        married_encoded = married_dict[ever_married]
        work_encoded = work_dict[work_type]
        residence_encoded = residence_dict[residence_type]
        smoking_encoded = smoking_dict[smoking_status]

        # Chuẩn bị dữ liệu đầu vào cho mô hình
        feature_names = ['gender', 'age', 'hypertension', 'heart_disease', 'ever_married', 
                         'work_type', 'Residence_type', 'avg_glucose_level', 'bmi', 'smoking_status']
        
        features = pd.DataFrame([[gender_encoded, age, hypertension, heart_disease, married_encoded, 
                                 work_encoded, residence_encoded, avg_glucose_level, bmi, smoking_encoded]], 
                                columns=feature_names)

        # Dự đoán
        prediction_probabilities = model.predict_proba(features)[0]
        stroke_probability = prediction_probabilities[1]
        
        # Calculate feature contributions/importance
        # Get feature importance from the model
        feature_importance = model.feature_importances_
        
        # Human-readable display names for features
        feature_display_names = {
            'gender': 'Gender',
            'age': 'Age',
            'hypertension': 'Hypertension', 
            'heart_disease': 'Heart Disease',
            'ever_married': 'Marriage Status',
            'work_type': 'Work Type',
            'Residence_type': 'Residence Type',
            'avg_glucose_level': 'Glucose Level',
            'bmi': 'BMI',
            'smoking_status': 'Smoking Status'
        }
        
        # Create a dictionary mapping feature names to their importances
        feature_importance_dict = dict(zip(feature_names, feature_importance))
        
        # Sort features by importance (descending)
        sorted_importance = sorted(feature_importance_dict.items(), key=lambda x: x[1], reverse=True)
        
        # Calculate relative importance (percentage)
        total_importance = sum(feature_importance)
        
        # Create a list of feature contributions with display names
        feature_contributions = []
        for feature, importance in sorted_importance:
            display_name = feature_display_names.get(feature, feature)
            feature_contributions.append({
                "feature": display_name,
                "importance": round(importance / total_importance * 100, 2),
                "raw_importance": float(importance),
                "field": feature  # Add the original field name for reference
            })

        return jsonify({
            "prediction": stroke_probability,
            "feedback": feedback,
            "feature_contributions": feature_contributions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)







