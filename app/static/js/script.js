document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips and popovers if using Bootstrap 5
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }
    
    // Add form progress tracking
    const formInputs = document.querySelectorAll('#strokeForm input, #strokeForm select');
    const totalFields = formInputs.length;
    let completedFields = 0;
    
    // Add form progress bar if it exists
    const progressBar = document.querySelector('.form-progress-bar-inner');
    const progressText = document.querySelector('.form-progress-text');
    
    // Check initial state
    if (progressBar && progressText) {
        updateFormProgress();
    }
    
    // Add tooltip triggers to form labels
    const formLabels = document.querySelectorAll('.form-label');
    formLabels.forEach(label => {
        // Only add if not already present
        if (!label.querySelector('.tooltip-trigger')) {
            const tooltipSpan = document.createElement('span');
            tooltipSpan.className = 'tooltip-trigger';
            tooltipSpan.setAttribute('data-bs-toggle', 'tooltip');
            tooltipSpan.setAttribute('data-bs-placement', 'top');
            
            // Set tooltip text based on input name
            const inputId = label.getAttribute('for');
            if (inputId) {
                const input = document.getElementById(inputId);
                if (input) {
                    let tooltipText = '';
                    switch(inputId) {
                        case 'gender':
                            tooltipText = 'Women have a higher lifetime risk of stroke than men';
                            break;
                        case 'age':
                            tooltipText = 'Stroke risk increases with age, doubling each decade after 55';
                            break;
                        case 'hypertension':
                            tooltipText = 'High blood pressure is the leading cause of stroke';
                            break;
                        case 'heart_disease':
                            tooltipText = 'Heart conditions like AFib increase stroke risk up to 5 times';
                            break;
                        case 'smoking_status':
                            tooltipText = 'Smoking doubles the risk of stroke';
                            break;
                        case 'bmi':
                            tooltipText = 'BMI over 25 increases stroke risk';
                            break;
                        case 'avg_glucose_level':
                            tooltipText = 'High blood glucose is a significant risk factor';
                            break;
                        default:
                            tooltipText = 'Fill this field for a more accurate prediction';
                    }
                    tooltipSpan.setAttribute('title', tooltipText);
                    tooltipSpan.innerHTML = '?';
                    label.appendChild(tooltipSpan);
                }
            }
        }
    });
    
    // Update form progress function
    function updateFormProgress() {
        completedFields = 0;
        formInputs.forEach(input => {
            if (input.value && input.value !== 'Select...') {
                completedFields++;
            }
        });
        
        const percentage = Math.round((completedFields / totalFields) * 100);
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        if (progressText) {
            progressText.textContent = `${completedFields}/${totalFields} fields completed (${percentage}%)`;
        }
        
        // Enable or disable submit button based on completion
        const submitBtn = document.querySelector('.submit-btn, button[type="submit"]');
        if (submitBtn) {
            if (percentage === 100) {
                submitBtn.classList.add('pulse-animation');
            } else {
                submitBtn.classList.remove('pulse-animation');
            }
        }
    }
    
    // Add animation to form sections on scroll
    const formSections = document.querySelectorAll('.form-section');
    if (formSections.length) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-section');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        formSections.forEach(section => {
            section.classList.add('section-hidden');
            sectionObserver.observe(section);
        });
    }
    
    // Add event listeners to track form completion
    formInputs.forEach(input => {
        input.addEventListener('change', updateFormProgress);
        input.addEventListener('input', updateFormProgress);
        
        // Add animation on focus
        input.addEventListener('focus', function() {
            this.closest('.form-group')?.classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.form-group')?.classList.remove('input-focused');
        });
    });
    
    // Enhanced Age Slider
    const ageSlider = document.getElementById('ageSlider');
    const ageValue = document.getElementById('age');
    const ageValueDisplay = document.querySelector('.age-value-display');
    
    if (ageSlider && ageValue) {
        // Create ticks if not present
        if (!document.querySelector('.age-ticks')) {
            const sliderContainer = ageSlider.closest('.age-slider-container') || ageSlider.parentNode;
            
            // Create value display
            if (!ageValueDisplay) {
                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'age-value-display';
                valueDisplay.textContent = ageSlider.value;
                sliderContainer.appendChild(valueDisplay);
            }
            
            // Create ticks
            const ticks = document.createElement('div');
            ticks.className = 'age-ticks';
            
            // Add tick marks
            const tickMarks = [0, 25, 50, 75, 100];
            tickMarks.forEach(mark => {
                const tick = document.createElement('span');
                tick.className = 'age-tick';
                tick.textContent = mark;
                ticks.appendChild(tick);
            });
            
            sliderContainer.appendChild(ticks);
        }
        
        ageSlider.addEventListener('input', function() {
            ageValue.value = this.value;
            updateAgeRiskClass(this.value);
            
            // Update value display
            const valueDisplay = document.querySelector('.age-value-display');
            if (valueDisplay) {
                valueDisplay.textContent = this.value;
                
                // Position the value display under the thumb
                const percent = (this.value - this.min) / (this.max - this.min);
                const thumbOffset = percent * (this.offsetWidth - 20);
                valueDisplay.style.left = `${thumbOffset + 10}px`;
            }
        });
        
        ageValue.addEventListener('input', function() {
            ageSlider.value = this.value;
            updateAgeRiskClass(this.value);
            
            // Update value display
            const valueDisplay = document.querySelector('.age-value-display');
            if (valueDisplay) {
                valueDisplay.textContent = this.value;
            }
        });
        
        function updateAgeRiskClass(age) {
            ageSlider.className = 'age-slider form-range';
            if (age > 65) {
                ageSlider.classList.add('high-risk');
            } else if (age > 45) {
                ageSlider.classList.add('medium-risk');
            } else {
                ageSlider.classList.add('low-risk');
            }
        }
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('light-mode');
            const isDarkMode = !document.body.classList.contains('light-mode');
            darkModeToggle.innerHTML = isDarkMode ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        });
    }
    
    // BMI Calculator with animation
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const calculateBmiBtn = document.getElementById('calculateBmi');
    const bmiResult = document.getElementById('bmiResult');
    
    if (calculateBmiBtn) {
        // Initially hide the result area
        if (bmiResult) {
            bmiResult.classList.remove('show');
        }
        
        calculateBmiBtn.addEventListener('click', function() {
            const height = parseFloat(heightInput.value) / 100; // Convert cm to meters
            const weight = parseFloat(weightInput.value);
            
            if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
                bmiResult.textContent = 'Please enter valid values';
                bmiResult.className = 'bmi-result text-warning show';
                return;
            }
            
            const bmi = weight / (height * height);
            let category, className;
            
            if (bmi < 18.5) {
                category = 'Underweight';
                className = 'text-warning';
            } else if (bmi < 25) {
                category = 'Normal weight';
                className = 'text-success';
            } else if (bmi < 30) {
                category = 'Overweight';
                className = 'text-warning';
            } else {
                category = 'Obese';
                className = 'text-danger';
            }
            
            bmiResult.innerHTML = `Your BMI: <strong>${bmi.toFixed(1)}</strong> (${category})`;
            bmiResult.className = `bmi-result ${className} show`;
            
            // Automatically fill BMI value in the prediction form
            const bmiInput = document.getElementById('bmi');
            if (bmiInput) {
                bmiInput.value = bmi.toFixed(1);
                
                // Trigger change event to update progress
                const event = new Event('change');
                bmiInput.dispatchEvent(event);
            }
        });
    }
    
    // Enhanced Health Metrics with hover effects
    const updateHealthMetrics = () => {
        const metrics = [
            { id: 'hypertension', values: { '0': 'Normal', '1': 'High' }, maxRisk: 1 },
            { id: 'heart_disease', values: { '0': 'None', '1': 'Present' }, maxRisk: 1 },
            { id: 'smoking_status', values: { 
                'never smoked': 'Never', 
                'formerly smoked': 'Former', 
                'smokes': 'Current', 
                'unknown': 'Unknown' 
            }, 
            riskMap: { 
                'never smoked': 0, 
                'formerly smoked': 0.5, 
                'smokes': 1, 
                'unknown': 0.25 
            }}
        ];
        
        metrics.forEach(metric => {
            const element = document.getElementById(metric.id);
            if (!element) return;
            
            const metricBar = document.getElementById(`${metric.id}Metric`);
            if (!metricBar) return;
            
            const value = element.value;
            const label = document.getElementById(`${metric.id}Value`);
            
            if (label) {
                label.textContent = metric.values[value] || value;
            }
            
            if (metricBar) {
                let riskPercent;
                if (metric.riskMap) {
                    riskPercent = (metric.riskMap[value] || 0) * 100;
                } else {
                    riskPercent = (parseInt(value) / metric.maxRisk) * 100;
                }
                
                // Animate the progress bar
                metricBar.style.transition = 'width 0.5s ease, background-color 0.5s ease';
                metricBar.style.width = `${riskPercent}%`;
                
                // Update color based on risk
                metricBar.className = 'progress-bar';
                if (riskPercent > 66) {
                    metricBar.classList.add('bg-danger');
                } else if (riskPercent > 33) {
                    metricBar.classList.add('bg-warning');
                } else {
                    metricBar.classList.add('bg-success');
                }
            }
        });
    };
    
    // Set up event listeners for all form inputs to update metrics
    document.querySelectorAll('#strokeForm select, #strokeForm input').forEach(input => {
        input.addEventListener('change', updateHealthMetrics);
    });
    
    // Initialize metrics on page load
    updateHealthMetrics();
    
    // Enhance the feature cards with hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.icon i');
            if (icon) {
                icon.classList.add('fa-beat');
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.icon i');
            if (icon) {
                icon.classList.remove('fa-beat');
            }
        });
    });
    
    // Initialize form progress on page load
    if (progressBar && progressText) {
        updateFormProgress();
    }
});

document.getElementById("strokeForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }

    const loadingSpinner = document.getElementById("loadingSpinner");
    const predictionResult = document.getElementById("predictionResult");
    const resultDiv = document.getElementById("result");
    const feedbackDiv = document.getElementById("feedbackContainer");
    const initialMessage = document.getElementById("initialMessage");

    // Hide initial message and show loading
    initialMessage.style.display = "none";
    loadingSpinner.style.display = "block";
    predictionResult.innerHTML = "";
    feedbackDiv.innerHTML = ""; // Clear previous feedback
    resultDiv.style.display = "block";
    feedbackDiv.style.display = "none"; // Hide until we have feedback
    
    // Dispatch event for responsive behavior
    document.dispatchEvent(new Event('formSubmitted'));

    // Define fallback links for each health factor if primary links fail
    const fallbackLinks = {
        gender: "https://www.stroke.org/en/about-stroke/stroke-risk-factors/women-have-a-higher-risk-of-stroke",
        age: "https://www.stroke.org/en/about-stroke/stroke-risk-factors/stroke-risk-factors-not-within-your-control",
        hypertension: "https://www.stroke.org/en/about-stroke/stroke-risk-factors/high-blood-pressure-and-stroke",
        heart_disease: "https://www.stroke.org/en/about-stroke/stroke-risk-factors/risk-factors-under-your-control",
        diabetes: "https://www.stroke.org/en/about-stroke/stroke-risk-factors/diabetes-and-stroke-prevention",
        smoking: "https://www.stroke.org/en/healthy-living/healthy-lifestyle/quit-smoking",
        bmi: "https://www.stroke.org/en/healthy-living/healthy-eating/healthy-weight",
        stroke_prevention: "https://www.stroke.org/en/about-stroke/preventing-another-stroke",
        general_health: "https://www.stroke.org/en/about-stroke/stroke-risk-factors"
    };

    // Secondary resources for additional information
    const secondaryResources = {
        hypertension: [
            {
                name: "Blood Pressure Management",
                url: "https://www.heart.org/en/health-topics/high-blood-pressure"
            },
            {
                name: "Mayo Clinic BP Guide",
                url: "https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/symptoms-causes/syc-20373410"
            }
        ],
        heart_disease: [
            {
                name: "Heart Disease Info",
                url: "https://my.clevelandclinic.org/health/diseases/24129-heart-disease"
            },
            {
                name: "Mayo Clinic Guide",
                url: "https://www.mayoclinic.org/diseases-conditions/heart-disease/symptoms-causes/syc-20353118"
            }
        ],
        diabetes: [
            {
                name: "Diabetes Basics",
                url: "https://www.diabetes.org/diabetes"
            },
            {
                name: "Mayo Clinic Guide",
                url: "https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444"
            }
        ],
        smoking: [
            {
                name: "Quit Smoking Help",
                url: "https://www.heart.org/en/healthy-living/healthy-lifestyle/quit-smoking-tobacco"
            },
            {
                name: "Smokefree.gov",
                url: "https://smokefree.gov/"
            }
        ],
        bmi: [
            {
                name: "BMI Calculator",
                url: "https://www.calculator.net/bmi-calculator.html"
            },
            {
                name: "Weight Management",
                url: "https://www.mayoclinic.org/healthy-lifestyle/weight-loss/basics/weightloss-basics/hlv-20049483"
            }
        ]
    };

    fetch("http://127.0.0.1:5000/predict", {  // Đảm bảo endpoint đúng
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        // Create tabs for organizing results
        const tabsContainer = document.createElement('ul');
        tabsContainer.className = 'nav nav-tabs';
        tabsContainer.innerHTML = `
            <li class="nav-item">
                <a class="nav-link active" id="prediction-tab" data-bs-toggle="tab" href="#prediction-content">
                    <i class="fas fa-chart-line me-2"></i>Prediction
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="insights-tab" data-bs-toggle="tab" href="#insights-content">
                    <i class="fas fa-lightbulb me-2"></i>Health Insights
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tips-tab" data-bs-toggle="tab" href="#tips-content">
                    <i class="fas fa-heart me-2"></i>Health Tips
                </a>
            </li>
        `;
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        
        // Prediction tab
        const predictionTab = document.createElement('div');
        predictionTab.className = 'tab-pane fade show active';
        predictionTab.id = 'prediction-content';
        
        // Display prediction result
        let riskLevel = "Low";
        let alertClass = "alert-success";
        let bgColor, textColor, borderColor;
        
        // Define colors with better contrast
        if (data.prediction > 0.7) {
            riskLevel = "High";
            alertClass = "alert-danger";
            bgColor = "#ffebee"; // Lighter red background
            textColor = "#c62828"; // Darker red text
            borderColor = "#f44336"; // Red border
        } else if (data.prediction > 0.3) {
            riskLevel = "Medium";
            alertClass = "alert-warning";
            bgColor = "#fff8e1"; // Lighter yellow background
            textColor = "#e65100"; // Dark orange text
            borderColor = "#ffc107"; // Yellow border
        } else {
            bgColor = "#e8f5e9"; // Lighter green background
            textColor = "#2e7d32"; // Darker green text
            borderColor = "#4caf50"; // Green border
        }

        // Create a larger, more prominent prediction result
        const alertDiv = document.createElement("div");
        alertDiv.classList.add("prediction-box");
        alertDiv.style.backgroundColor = bgColor;
        alertDiv.style.boxShadow = `0 8px 30px rgba(0, 0, 0, 0.15), 0 0 0 2px ${borderColor}`;
        alertDiv.setAttribute("role", "alert");
        alertDiv.style.cursor = "pointer"; // Add cursor pointer to indicate it's clickable
        
        // Store the contribution data in a data attribute for easy access
        alertDiv.setAttribute("data-contributions", JSON.stringify(data.feature_contributions));
        
        // Create a more prominent display with larger text and better contrast
        alertDiv.innerHTML = `
            <div class="prediction-content">
                <h3 class="mb-3" style="color: #333;">Predicted Stroke Risk</h3>
                <div class="risk-value" style="color: ${textColor};">
                    <strong>${riskLevel}</strong> 
                </div>
                <div class="risk-percentage mb-3" style="color: ${textColor};">${(data.prediction * 100).toFixed(2)}%</div>
                <div class="progress mb-3" style="height: 12px; background-color: rgba(0,0,0,0.1);">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${data.prediction * 100}%; background-color: ${textColor}" 
                         aria-valuenow="${data.prediction * 100}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="mt-3 text-center click-action">
                    <span class="click-hint">
                        <i class="fas fa-mouse-pointer me-1"></i> Click to see detailed breakdown of your risk factors
                    </span>
                </div>
            </div>
        `;

        predictionTab.appendChild(alertDiv);

        // Add explanation of the risk level
        const riskExplanation = document.createElement('div');
        riskExplanation.className = 'mt-4';
        riskExplanation.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-info-circle me-2"></i>What does this mean?</h5>
            <p>This prediction is based on the information you provided and our machine learning model. 
            ${data.prediction > 0.7 ? 
                'A high risk level suggests you should consult with a healthcare provider promptly to discuss stroke prevention strategies.' : 
                data.prediction > 0.3 ? 
                    'A medium risk level suggests you should be mindful of stroke risk factors and consider discussing them with your healthcare provider.' :
                    'A low risk level suggests your current risk factors indicate a lower probability of stroke, but it\'s still important to maintain a healthy lifestyle.'
            }</p>
        `;
        predictionTab.appendChild(riskExplanation);
        
        // Add BMI and Glucose comparison charts
        const healthMetricsCharts = document.createElement('div');
        healthMetricsCharts.className = 'health-metrics-charts mt-4';
        healthMetricsCharts.innerHTML = `
            <h5><i class="fas fa-chart-bar me-2"></i>Your Health Metrics Comparison</h5>
            <div class="mb-5">
                <div class="chart-container">
                    <h6 class="chart-title"><i class="fas fa-weight me-2"></i>BMI</h6>
                    <canvas id="bmiChart"></canvas>
                </div>
            </div>
            <div class="mt-4">
                <div class="chart-container">
                    <h6 class="chart-title"><i class="fas fa-tint me-2"></i>Glucose Level</h6>
                    <canvas id="glucoseChart"></canvas>
                </div>
            </div>
        `;
        predictionTab.appendChild(healthMetricsCharts);
        
        // Extract BMI and glucose values from the form
        const bmiValue = parseFloat(document.getElementById('bmi').value);
        const glucoseValue = parseFloat(document.getElementById('avg_glucose_level').value);
        
        // Create the charts after DOM is updated
        setTimeout(() => {
            createBmiComparisonChart(bmiValue);
            createGlucoseComparisonChart(glucoseValue);
        }, 100);
        
        // Health Insights tab
        const insightsTab = document.createElement('div');
        insightsTab.className = 'tab-pane fade';
        insightsTab.id = 'insights-content';
        
        // Health Tips tab
        const tipsTab = document.createElement('div');
        tipsTab.className = 'tab-pane fade';
        tipsTab.id = 'tips-content';
        
        // Add health tips based on form data and prediction
        const healthTips = getHealthTips(data, formData);
        
        tipsTab.innerHTML = `
            <h5 class="mb-4"><i class="fas fa-heart me-2"></i>Personalized Health Recommendations</h5>
            <div class="health-tips-container">
                ${healthTips.map(tip => `
                    <div class="health-tip mb-4">
                        <div class="health-tip-title">
                            <i class="${tip.icon}"></i> ${tip.title}
                        </div>
                        <p class="mt-2">${tip.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Assemble the tabs
        tabContent.appendChild(predictionTab);
        tabContent.appendChild(insightsTab);
        tabContent.appendChild(tipsTab);
        
        predictionResult.appendChild(tabsContainer);
        predictionResult.appendChild(tabContent);
        
        // Display feedback if available in the insights tab
        if (data.feedback && data.feedback.length > 0) {
            feedbackDiv.style.display = "block";
            
            // Create header for feedback section
            const feedbackHeader = document.createElement("h5");
            feedbackHeader.className = "mb-3";
            feedbackHeader.innerHTML = '<i class="fas fa-lightbulb me-2"></i>Risk Factor Analysis';
            insightsTab.appendChild(feedbackHeader);

            // Create a row for the grid layout
            const insightsRow = document.createElement("div");
            insightsRow.className = "row insights-grid";
            insightsTab.appendChild(insightsRow);

            // Create feedback cards
            data.feedback.forEach((item, index) => {
                // Add animation delay based on index
                const delay = index * 0.1;
                
                // Create a column for each insight
                const insightCol = document.createElement("div");
                insightCol.className = "col-md-6 col-lg-4 mb-3";
                
                const feedbackCard = document.createElement("div");
                feedbackCard.className = "card compact-insight-card";
                feedbackCard.style.animationDelay = `${delay}s`;
                
                // Add appropriate icon based on field
                let iconClass = "fas fa-info-circle";
                if (item.field === "hypertension") iconClass = "fas fa-heartbeat";
                else if (item.field === "heart_disease") iconClass = "fas fa-heart";
                else if (item.field === "smoking_status") iconClass = "fas fa-smoking";
                else if (item.field === "bmi") iconClass = "fas fa-weight";
                else if (item.field === "age") iconClass = "fas fa-user-clock";
                else if (item.field === "avg_glucose_level") iconClass = "fas fa-tint";
                
                // Ensure we have a valid link - use fallback if needed
                const healthLink = item.info && item.info.link ? item.info.link : fallbackLinks[item.field] || "#";
                
                // Get additional resources for this health factor
                let additionalLinks = '';
                const resources = secondaryResources[item.field];
                if (resources && resources.length > 0) {
                    additionalLinks = `
                        <div class="additional-resources mt-2">
                            <small class="d-block mb-2 text-white-50">Additional resources:</small>
                            ${resources.map(resource => `
                                <a href="${resource.url}" class="btn btn-outline-info btn-sm me-1 mb-1" target="_blank">
                                    <i class="fas fa-external-link-alt me-1"></i>${resource.name}
                                </a>
                            `).join('')}
                        </div>
                    `;
                } else {
                    // Add empty additional resources section for consistent spacing
                    additionalLinks = `<div class="additional-resources mt-2"></div>`;
                }
                
                // Ensure consistent structure with title at top, content in middle, 
                // and learn more button with verification at the bottom
                feedbackCard.innerHTML = `
                    <div class="card-body d-flex flex-column">
                        <h5 class="insight-title"><i class="${iconClass}"></i>${capitalizeFirstLetter(item.field.replace(/_/g, ' '))}</h5>
                        <p class="card-text flex-grow-1">${item.message}</p>
                        <div class="mt-auto">
                            <div class="link-container d-flex align-items-center">
                                <a href="${healthLink}" class="btn btn-info btn-sm" target="_blank">
                                    <i class="fas fa-external-link-alt me-1"></i>LEARN MORE
                                </a>
                                <button type="button" class="btn btn-sm btn-link text-info verify-link-btn ms-2" 
                                    data-link="${healthLink}" 
                                    title="Verify this link works">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        </div>
                        ${additionalLinks}
                        </div>
                    </div>
                `;
                
                insightCol.appendChild(feedbackCard);
                insightsRow.appendChild(insightCol);
            });
            
            // Add event listeners to verify link buttons
            document.querySelectorAll('.verify-link-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const link = this.getAttribute('data-link');
                    const icon = this.querySelector('i');
                    const linkBtn = this.previousElementSibling;
                    
                    icon.className = 'fas fa-spinner fa-spin';
                    this.disabled = true;
                    
                    // Simulate link checking (in a real app, you would use fetch to check the link)
                    setTimeout(() => {
                        // For demo purposes, we'll assume 90% of links work
                        const linkWorks = Math.random() > 0.1;
                        
                        if (linkWorks) {
                            icon.className = 'fas fa-check-circle';
                            this.classList.add('text-success');
                            this.title = 'Link verified successfully';
                        } else {
                            icon.className = 'fas fa-exclamation-triangle';
                            this.classList.add('text-warning');
                            this.title = 'Link may not work - try alternative resources';
                            
                            // Update the main link to use a fallback
                            if (fallbackLinks[item.field]) {
                                linkBtn.href = fallbackLinks[item.field];
                                linkBtn.innerHTML = `<i class="fas fa-external-link-alt me-1"></i>Alternative Resource`;
                            }
                        }
                    }, 1500);
                });
            });
        }
        
        // Hide loading spinner
        loadingSpinner.style.display = "none";
        
        // Scroll to results if needed
        const resultsElement = document.querySelector('.results-container');
        if (resultsElement && window.innerWidth < 768) {
            resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Initialize the Bootstrap tabs
        if (typeof bootstrap !== 'undefined') {
            const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
            tabElements.forEach(tabElement => {
                tabElement.addEventListener('click', function (event) {
                    event.preventDefault();
                    const tabTarget = document.querySelector(this.getAttribute('href'));
                    if (tabTarget) {
                        // Hide all tab panes
                        document.querySelectorAll('.tab-pane').forEach(pane => {
                            pane.classList.remove('show', 'active');
                        });
                        // Show the clicked tab pane
                        tabTarget.classList.add('show', 'active');
                        
                        // Update active state on tabs
                        document.querySelectorAll('.nav-link').forEach(link => {
                            link.classList.remove('active');
                        });
                        this.classList.add('active');
                    }
                });
            });
        }
    })
    .catch(error => {
        loadingSpinner.style.display = "none";
        
        // Check if there's specific error information
        let errorMessage = error.message;
        let errorInfo = null;
        
        try {
            // Try to parse error message as JSON
            const errorData = JSON.parse(errorMessage);
            if (errorData.error) {
                errorMessage = errorData.error;
            }
            if (errorData.info) {
                errorInfo = errorData.info;
            }
        } catch (e) {
            // Not JSON, use as is
        }
        
        // Create error alert
        const alertDiv = document.createElement("div");
        alertDiv.classList.add("alert", "alert-danger");
        alertDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i><strong>Error:</strong> ${errorMessage}`;
        
        // Add health information if available
        if (errorInfo && errorInfo.message) {
            alertDiv.innerHTML += `
                <div class="mt-2">
                    <p>${errorInfo.message}</p>
                    ${errorInfo.link ? `
                        <a href="${errorInfo.link}" class="btn btn-outline-light btn-sm mt-1" target="_blank">
                            <i class="fas fa-external-link-alt me-1"></i>Learn More
                        </a>
                    ` : ''}
                </div>
            `;
        }
        
        predictionResult.appendChild(alertDiv);
    });
});

function capitalizeFirstLetter(string) {
    return string.replace(/\b\w/g, l => l.toUpperCase());
}

function handleResponsiveLayout() {
    const resultsContainer = document.querySelector('.results-container');
    const formColumn = document.querySelector('.col-md-6:first-child');
    const resultColumn = document.querySelector('.col-md-6:last-child');
    
    if (window.innerWidth < 768) { // Below md breakpoint
        // Mobile layout adjustments if needed
    } else {
        // Desktop layout adjustments if needed
    }
}

function getHealthTips(data, formData) {
    const tips = [];
    
    // General tip for everyone
    tips.push({
        icon: 'fas fa-utensils',
        title: 'Maintain a Balanced Diet',
        content: 'Eat a diet rich in fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit sodium, added sugars, and unhealthy fats.'
    });
    
    // Add tips based on risk factors
    if (formData.hypertension === '1') {
        tips.push({
            icon: 'fas fa-heartbeat',
            title: 'Monitor Blood Pressure',
            content: 'Regular blood pressure monitoring is crucial. Aim for a reading below 120/80 mmHg. Consider using a home blood pressure monitor for convenience.'
        });
    }
    
    if (formData.heart_disease === '1') {
        tips.push({
            icon: 'fas fa-heart',
            title: 'Heart Health Management',
            content: 'Follow your doctor\'s recommendations for heart disease management. Take prescribed medications consistently and attend all follow-up appointments.'
        });
    }
    
    if (formData.smoking_status === 'smokes') {
        tips.push({
            icon: 'fas fa-smoking-ban',
            title: 'Quit Smoking',
            content: 'Smoking greatly increases stroke risk. Consider nicotine replacement therapy, medications, or support groups to help quit.'
        });
    }
    
    const bmi = parseFloat(formData.bmi);
    if (bmi >= 25) {
        tips.push({
            icon: 'fas fa-weight',
            title: 'Weight Management',
            content: `Your BMI of ${bmi.toFixed(1)} indicates ${bmi >= 30 ? 'obesity' : 'overweight'}. Even a modest weight loss of 5-10% can significantly improve health markers and reduce stroke risk.`
        });
    }
    
    const glucose = parseFloat(formData.avg_glucose_level);
    if (glucose > 140) {
        tips.push({
            icon: 'fas fa-tint',
            title: 'Manage Blood Glucose',
            content: `Your average glucose level of ${glucose.toFixed(1)} mg/dL is elevated. Consider discussing diabetes testing with your healthcare provider and focus on controlling blood sugar through diet and exercise.`
        });
    }
    
    const age = parseInt(formData.age);
    if (age > 55) {
        tips.push({
            icon: 'fas fa-user-clock',
            title: 'Age-Appropriate Health Screenings',
            content: 'Regular health screenings become increasingly important as you age. Discuss with your healthcare provider which screenings are recommended for someone your age.'
        });
    }
    
    // Exercise recommendation for everyone
    tips.push({
        icon: 'fas fa-running',
        title: 'Regular Physical Activity',
        content: 'Aim for at least 150 minutes of moderate-intensity exercise per week. Include both aerobic activity and strength training for optimal health benefits.'
    });
    
    // Stress management
    tips.push({
        icon: 'fas fa-brain',
        title: 'Stress Management',
        content: 'Chronic stress can contribute to stroke risk. Consider stress-reduction techniques such as meditation, deep breathing exercises, yoga, or tai chi.'
    });
    
    return tips;
}

function getHealthFeedback(data, prediction) {
    // This function would generate customized health feedback based on the form data
    // It's not being used in the current implementation but could be expanded in the future
    const feedback = [];
    
    // Example structured feedback
    if (data.gender === 'female' && data.age > 55) {
        feedback.push({
            title: 'Women\'s Health',
            content: 'Postmenopausal women have increased stroke risk. Consider discussing hormone therapy risks with your doctor.'
        });
    }

    return feedback;
}

function createBmiComparisonChart(userBmi) {
    if (!userBmi) return;
    
    const ctx = document.getElementById('bmiChart');
    if (!ctx) return;
    
    // Clear any existing content
    ctx.innerHTML = '';
    
    // Create a horizontal gauge visualization
    const gaugeContainer = document.createElement('div');
    gaugeContainer.className = 'horizontal-gauge-container';
    ctx.parentNode.replaceChild(gaugeContainer, ctx);
    
    // BMI ranges and colors
    const ranges = [
        { min: 0, max: 18.5, label: 'Underweight', color: '#FFC107' },   // Yellow
        { min: 18.5, max: 25, label: 'Normal', color: '#4CAF50' },       // Green
        { min: 25, max: 30, label: 'Overweight', color: '#FF9800' },     // Orange
        { min: 30, max: 50, label: 'Obese', color: '#F44336' }           // Red
    ];
    
    // Create gauge track (full bar)
    const gaugeTrack = document.createElement('div');
    gaugeTrack.className = 'gauge-track';
    
    // Create colored segments
    const totalRange = ranges[ranges.length - 1].max - ranges[0].min;
    
    ranges.forEach(range => {
        const segment = document.createElement('div');
        segment.className = 'gauge-segment';
        segment.style.width = `${((range.max - range.min) / totalRange) * 100}%`;
        segment.style.backgroundColor = range.color;
        segment.setAttribute('data-range', `${range.min}-${range.max}`);
        segment.setAttribute('data-label', range.label);
        gaugeTrack.appendChild(segment);
    });
    
    // Create ticks and labels
    const ticksContainer = document.createElement('div');
    ticksContainer.className = 'gauge-ticks';
    
    // Add key ticks at important BMI values
    const keyTicks = [0, 18.5, 25, 30, 50];
    keyTicks.forEach(value => {
        const tick = document.createElement('div');
        tick.className = 'gauge-tick';
        tick.style.left = `${((value - ranges[0].min) / totalRange) * 100}%`;
        
        const tickLabel = document.createElement('div');
        tickLabel.className = 'gauge-tick-label';
        tickLabel.textContent = value;
        tick.appendChild(tickLabel);
        
        ticksContainer.appendChild(tick);
    });
    
    // Add category labels under segments
    const categoryLabels = document.createElement('div');
    categoryLabels.className = 'gauge-category-labels';
    
    ranges.forEach(range => {
        const label = document.createElement('div');
        label.className = 'gauge-category-label';
        label.textContent = range.label;
        // Position in the middle of segment
        const segmentMiddle = (range.min + range.max) / 2;
        label.style.left = `${((segmentMiddle - ranges[0].min) / totalRange) * 100}%`;
        categoryLabels.appendChild(label);
    });
    
    // Create and position the indicator for user's BMI
    const userIndicator = document.createElement('div');
    userIndicator.className = 'user-indicator';
    const userPosition = Math.min(Math.max(userBmi, ranges[0].min), ranges[ranges.length - 1].max);
    userIndicator.style.left = `${((userPosition - ranges[0].min) / totalRange) * 100}%`;
    
    // Add user value label
    const userLabel = document.createElement('div');
    userLabel.className = 'user-indicator-label';
    userLabel.innerHTML = `Your BMI: ${userBmi.toFixed(1)}`;
    userIndicator.appendChild(userLabel);
    
    // Assemble the gauge
    gaugeContainer.appendChild(gaugeTrack);
    gaugeContainer.appendChild(userIndicator);
    gaugeContainer.appendChild(ticksContainer);
    gaugeContainer.appendChild(categoryLabels);
    
    // Add description (skip the title since we already have one in the HTML)
    const gaugeDescription = document.createElement('div');
    gaugeDescription.className = 'gauge-description';
    
    // Determine user's category
    let userCategory = '';
    for (const range of ranges) {
        if (userBmi >= range.min && userBmi < range.max) {
            userCategory = range.label;
            break;
        }
    }
    
    // Add description text based on user's BMI category
    gaugeDescription.innerHTML = `<p>Your BMI of <strong>${userBmi.toFixed(1)}</strong> falls in the <strong>${userCategory}</strong> category.</p>`;
    if (userCategory === 'Underweight') {
        gaugeDescription.innerHTML += '<p>Being underweight may indicate nutritional deficiencies or other health concerns.</p>';
    } else if (userCategory === 'Normal') {
        gaugeDescription.innerHTML += '<p>A BMI in the normal range is associated with lower risk of weight-related health issues.</p>';
    } else if (userCategory === 'Overweight') {
        gaugeDescription.innerHTML += '<p>Being overweight may increase your risk of certain health conditions.</p>';
    } else if (userCategory === 'Obese') {
        gaugeDescription.innerHTML += '<p>Obesity is associated with higher risk of stroke, heart disease, and other health conditions.</p>';
    }
    
    // Insert description after the gauge (no title)
    gaugeContainer.parentNode.appendChild(gaugeDescription);
}

function createGlucoseComparisonChart(userGlucose) {
    if (!userGlucose) return;
    
    const ctx = document.getElementById('glucoseChart');
    if (!ctx) return;
    
    // Clear any existing content
    ctx.innerHTML = '';
    
    // Create a horizontal gauge visualization
    const gaugeContainer = document.createElement('div');
    gaugeContainer.className = 'horizontal-gauge-container';
    ctx.parentNode.replaceChild(gaugeContainer, ctx);
    
    // Glucose ranges and colors
    const ranges = [
        { min: 70, max: 100, label: 'Normal', color: '#4CAF50' },          // Green
        { min: 100, max: 126, label: 'Prediabetes', color: '#FF9800' },    // Orange
        { min: 126, max: 200, label: 'Diabetes', color: '#F44336' }        // Red
    ];
    
    // Create gauge track (full bar)
    const gaugeTrack = document.createElement('div');
    gaugeTrack.className = 'gauge-track';
    
    // Create colored segments
    const totalRange = ranges[ranges.length - 1].max - ranges[0].min;
    
    ranges.forEach(range => {
        const segment = document.createElement('div');
        segment.className = 'gauge-segment';
        segment.style.width = `${((range.max - range.min) / totalRange) * 100}%`;
        segment.style.backgroundColor = range.color;
        segment.setAttribute('data-range', `${range.min}-${range.max}`);
        segment.setAttribute('data-label', range.label);
        gaugeTrack.appendChild(segment);
    });
    
    // Create ticks and labels
    const ticksContainer = document.createElement('div');
    ticksContainer.className = 'gauge-ticks';
    
    // Add key ticks at important glucose values
    const keyTicks = [70, 100, 126, 200];
    keyTicks.forEach(value => {
        const tick = document.createElement('div');
        tick.className = 'gauge-tick';
        tick.style.left = `${((value - ranges[0].min) / totalRange) * 100}%`;
        
        const tickLabel = document.createElement('div');
        tickLabel.className = 'gauge-tick-label';
        tickLabel.textContent = value;
        tick.appendChild(tickLabel);
        
        ticksContainer.appendChild(tick);
    });
    
    // Add category labels under segments
    const categoryLabels = document.createElement('div');
    categoryLabels.className = 'gauge-category-labels';
    
    ranges.forEach(range => {
        const label = document.createElement('div');
        label.className = 'gauge-category-label';
        label.textContent = range.label;
        // Position in the middle of segment
        const segmentMiddle = (range.min + range.max) / 2;
        label.style.left = `${((segmentMiddle - ranges[0].min) / totalRange) * 100}%`;
        categoryLabels.appendChild(label);
    });
    
    // Create and position the indicator for user's glucose
    const userIndicator = document.createElement('div');
    userIndicator.className = 'user-indicator';
    const userPosition = Math.min(Math.max(userGlucose, ranges[0].min), ranges[ranges.length - 1].max);
    userIndicator.style.left = `${((userPosition - ranges[0].min) / totalRange) * 100}%`;
    
    // Add user value label
    const userLabel = document.createElement('div');
    userLabel.className = 'user-indicator-label';
    userLabel.innerHTML = `Your Glucose: ${userGlucose.toFixed(1)} mg/dL`;
    userIndicator.appendChild(userLabel);
    
    // Assemble the gauge
    gaugeContainer.appendChild(gaugeTrack);
    gaugeContainer.appendChild(userIndicator);
    gaugeContainer.appendChild(ticksContainer);
    gaugeContainer.appendChild(categoryLabels);
    
    // Add description (skip the title since we already have one in the HTML)
    const gaugeDescription = document.createElement('div');
    gaugeDescription.className = 'gauge-description';
    
    // Determine user's category
    let userCategory = '';
    for (const range of ranges) {
        if (userGlucose >= range.min && userGlucose < range.max) {
            userCategory = range.label;
            break;
        }
    }
    // Handle case where glucose is above the highest range
    if (userGlucose >= ranges[ranges.length - 1].max) {
        userCategory = ranges[ranges.length - 1].label;
    }
    
    // Add description text based on user's glucose category
    gaugeDescription.innerHTML = `<p>Your glucose level of <strong>${userGlucose.toFixed(1)} mg/dL</strong> falls in the <strong>${userCategory}</strong> category.</p>`;
    if (userCategory === 'Normal') {
        gaugeDescription.innerHTML += '<p>A fasting glucose level under 100 mg/dL is considered normal.</p>';
    } else if (userCategory === 'Prediabetes') {
        gaugeDescription.innerHTML += '<p>A fasting glucose level between 100-125 mg/dL indicates prediabetes. This is a warning sign to make lifestyle changes.</p>';
    } else if (userCategory === 'Diabetes') {
        gaugeDescription.innerHTML += '<p>A fasting glucose level of 126 mg/dL or higher may indicate diabetes. It\'s important to consult with a healthcare provider.</p>';
    }
    
    // Insert description after the gauge (no title)
    gaugeContainer.parentNode.appendChild(gaugeDescription);
}

/**
 * Creates a chart showing the contribution of each feature to the prediction
 * @param {Array} contributionsData - The feature contributions data from the server
 */
function createContributionsChart(contributionsData) {
    if (!contributionsData || contributionsData.length === 0) return;
    
    const ctx = document.getElementById('contributionsChart');
    if (!ctx) return;
    
    // Sort contributions by importance descending
    const sortedContributions = [...contributionsData].sort((a, b) => b.importance - a.importance);
    
    // Extract labels and data
    const labels = sortedContributions.map(item => item.feature);
    const data = sortedContributions.map(item => item.importance);
    
    // Generate colors based on importance
    const backgroundColors = sortedContributions.map(item => {
        if (item.importance > 30) return '#F44336'; // Red for high importance
        if (item.importance > 15) return '#FF9800'; // Orange for medium importance  
        if (item.importance > 5) return '#2196F3';  // Blue for low-medium importance
        return '#4CAF50';  // Green for low importance
    });
    
    // Create the chart
    new Chart(ctx, {
        type: 'bar', // Bar chart is the new horizontalBar in newer Chart.js versions
        data: {
            labels: labels,
            datasets: [{
                label: 'Contribution to Risk (%)',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color), // Same as background
                borderWidth: 1,
                barPercentage: 0.8,
                // For highlighting the bar when hovering
                hoverBackgroundColor: backgroundColors.map(color => {
                    // Lighten the color slightly
                    return color + '99'; // Add transparency
                })
            }]
        },
        options: {
            indexAxis: 'y', // This makes the bars horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide legend since we only have one dataset
                },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw.toFixed(2) + '% contribution';
                        },
                        afterLabel: function(context) {
                            // Get the associated feature's data
                            const featureData = sortedContributions[context.dataIndex];
                            
                            // Create a human-readable description
                            let description = '';
                            
                            // Add feature-specific explanations
                            switch(featureData.field) {
                                case 'age':
                                    description = 'Age is a major risk factor for stroke, with risk doubling each decade after 55.';
                                    break;
                                case 'hypertension':
                                    description = 'Having high blood pressure greatly increases stroke risk.';
                                    break;
                                case 'heart_disease':
                                    description = 'Heart disease significantly raises stroke risk.';
                                    break;
                                case 'avg_glucose_level':
                                    description = 'Elevated glucose levels increase stroke risk.';
                                    break;
                                case 'bmi':
                                    description = 'BMI outside the normal range can contribute to stroke risk.';
                                    break;
                                case 'smoking_status':
                                    description = 'Smoking damages blood vessels and increases stroke risk.';
                                    break;
                                default:
                                    description = `This factor contributes ${featureData.importance.toFixed(2)}% to your overall risk.`;
                            }
                            
                            return description;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Contribution (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Risk Factors'
                    }
                }
            }
        }
    });
    
    // Add a note below the chart explaining feature importance
    const noteContainer = document.createElement('div');
    noteContainer.className = 'chart-note mt-3';
    noteContainer.innerHTML = `
        <p class="small text-muted">
            <i class="fas fa-info-circle me-1"></i>
            <strong>Note:</strong> Feature importance percentages show how each factor influences the prediction algorithm.
            Higher percentages indicate factors that have a greater impact on determining your risk score based on the model's analysis of patterns in stroke data.
        </p>
    `;
    
    // Insert the note after the chart
    ctx.parentNode.parentNode.appendChild(noteContainer);
}

// This function is no longer used as the modal has been replaced by the expanding box
// Kept for reference in case functionality needs to be reintegrated 
function showContributionsModal(contributionsData) {
    if (!contributionsData || contributionsData.length === 0) {
        alert("Feature contribution data is not available for this prediction.");
        return;
    }
    
    // Sort contributions by importance
    const sortedContributions = [...contributionsData].sort((a, b) => b.importance - a.importance);
    const topFactor = sortedContributions[0];
    
    // Calculate the maximum contribution value for scaling
    const maxContribution = Math.max(...sortedContributions.map(item => item.importance));
    
    // Create modal container
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content contributions-modal';
    
    // Add header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `
        <h4 class="modal-title">
            <i class="fas fa-percentage me-2"></i>Stroke Risk Factor Breakdown
        </h4>
        <button type="button" class="modal-close" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    modalContent.appendChild(modalHeader);
    
    // Add modal body with an enhanced layout
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body compact-view';
    
    // Create the new layout
    modalBody.innerHTML = `
        <div class="enhanced-risk-breakdown">
            <!-- Top Factor Insight -->
            <div class="key-insight-box">
                <div class="insight-header">
                    <h5><i class="fas fa-exclamation-circle me-2"></i>Key Risk Factor</h5>
                    <div class="key-factor">
                        <span class="factor-name">${topFactor.feature}</span>
                        <span class="factor-value">${topFactor.importance.toFixed(1)}%</span>
                    </div>
                </div>
                <p class="insight-message"></p>
            </div>
            
            <!-- Enhanced Interactive Table -->
            <div class="factors-table-container">
                <table class="enhanced-factors-table">
                    <thead>
                        <tr>
                            <th width="20%">Factor</th>
                            <th width="15%">Impact</th>
                            <th width="65%">Contribution Scale</th>
                        </tr>
                    </thead>
                    <tbody id="factorsTableBody">
                        <!-- Factors will be inserted here -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    modalContent.appendChild(modalBody);
    
    // Add simple footer with action buttons
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-primary action-button">
            <i class="fas fa-download me-1"></i>Download Report
        </button>
        <button type="button" class="btn btn-secondary close-button">
            Close
        </button>
    `;
    modalContent.appendChild(modalFooter);
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Populate the key insight message based on top factor
    const insightMessage = modalBody.querySelector('.insight-message');
    
    // Add actionable information based on top factor
    let actionMessage = '';
    switch(topFactor.field) {
        case 'age':
            actionMessage = `While age cannot be modified, managing other factors can reduce overall stroke risk.`;
            break;
        case 'hypertension':
            actionMessage = `Regular blood pressure monitoring and management is crucial for reducing this risk.`;
            break;
        case 'heart_disease':
            actionMessage = `Following doctor's recommendations for heart health is essential.`;
            break;
        case 'avg_glucose_level':
            actionMessage = `Diet, exercise, and medication can help manage blood sugar levels.`;
            break;
        case 'bmi':
            actionMessage = `Working toward a healthy weight can significantly reduce stroke risk.`;
            break;
        case 'smoking_status':
            actionMessage = `Quitting smoking can significantly reduce stroke risk over time.`;
            break;
        default:
            actionMessage = `Focusing on this area can potentially reduce your overall stroke risk.`;
    }
    
    insightMessage.textContent = actionMessage;
    
    // Populate the enhanced interactive factors table
    const tableBody = modalBody.querySelector('#factorsTableBody');
    
    sortedContributions.forEach(contribution => {
        const tr = document.createElement('tr');
        tr.className = 'factor-row';
        tr.setAttribute('data-factor', contribution.field);
        
        // Determine impact level and color based on contribution value
        let impactLevel, impactClass;
        if (contribution.importance > 30) {
            impactLevel = "VERY HIGH";
            impactClass = "risk-factor-high";
        } else if (contribution.importance > 15) {
            impactLevel = "HIGH";
            impactClass = "risk-factor-medium";
        } else if (contribution.importance > 5) {
            impactLevel = "MEDIUM";
            impactClass = "risk-factor-low-med";
        } else {
            impactLevel = "LOW";
            impactClass = "risk-factor-low";
        }
        
        // Create the scale bar with proper percentage width
        const percentOfMax = (contribution.importance / maxContribution) * 100;
        const formattedPercentage = contribution.importance.toFixed(1) + '%';
        
        tr.innerHTML = `
            <td class="factor-name-cell">${contribution.feature}</td>
            <td><span class="impact-badge ${impactClass}">${impactLevel}</span></td>
            <td class="contribution-scale-cell">
                <div class="contribution-scale-wrapper">
                    <div class="contribution-scale ${impactClass}" 
                         style="width: ${percentOfMax}%" 
                         data-percentage="${formattedPercentage}">
                        <span class="scale-value">${formattedPercentage}</span>
                    </div>
                </div>
            </td>
        `;
        
        // Add click event for row interaction
        tr.addEventListener('click', () => {
            // Remove active class from all rows
            document.querySelectorAll('.factor-row').forEach(row => {
                row.classList.remove('active');
            });
            
            // Add active class to clicked row
            tr.classList.add('active');
            
            // Show factor detail information
            let detailInfo = '';
            switch(contribution.field) {
                case 'age':
                    detailInfo = 'Age is a non-modifiable risk factor. Stroke risk doubles each decade after 55.';
                    break;
                case 'hypertension':
                    detailInfo = 'High blood pressure is a leading cause of stroke. Regular monitoring and treatment can help manage this risk.';
                    break;
                case 'heart_disease':
                    detailInfo = 'Heart conditions significantly increase stroke risk. Follow your doctor\'s treatment recommendations.';
                    break;
                case 'avg_glucose_level':
                    detailInfo = 'Elevated blood glucose can damage blood vessels over time, increasing stroke risk.';
                    break;
                case 'bmi':
                    detailInfo = 'BMI outside the normal range (18.5-24.9) increases risk. Even modest weight loss can reduce risk.';
                    break;
                case 'smoking_status':
                    detailInfo = 'Smoking damages blood vessels and increases clot formation risk, leading to higher stroke probability.';
                    break;
                case 'work_type':
                    detailInfo = 'Work type can influence stress levels, physical activity, and other lifestyle factors affecting stroke risk.';
                    break;
                case 'Residence_type':
                    detailInfo = 'Urban vs. rural living may impact access to healthcare and exposure to environmental factors.';
                    break;
                case 'gender':
                    detailInfo = 'Gender influences stroke risk patterns. Women have some unique risk factors including pregnancy and hormone therapy.';
                    break;
                case 'ever_married':
                    detailInfo = 'Marital status may correlate with lifestyle and social support factors that influence health outcomes.';
                    break;
                default:
                    detailInfo = `This factor contributes ${contribution.importance.toFixed(1)}% to your overall stroke risk prediction.`;
            }
            
            // Show tooltip or update info section
            const existingDetail = modalBody.querySelector('.factor-detail-box');
            if (existingDetail) {
                existingDetail.remove();
            }
            
            const detailBox = document.createElement('div');
            detailBox.className = 'factor-detail-box';
            detailBox.innerHTML = `
                <h6><i class="fas fa-info-circle me-2"></i>${contribution.feature} Information</h6>
                <p>${detailInfo}</p>
            `;
            
            // Insert after the table
            const tableContainer = modalBody.querySelector('.factors-table-container');
            tableContainer.insertAdjacentElement('afterend', detailBox);
        });
        
        tableBody.appendChild(tr);
    });
    
    // Highlight the first row by default
    setTimeout(() => {
        const firstRow = tableBody.querySelector('.factor-row');
        if (firstRow) {
            firstRow.click();
        }
    }, 200);
    
    // Add event listeners for closing modal
    const closeModal = () => {
        modalOverlay.classList.add('closing');
        setTimeout(() => {
            document.body.removeChild(modalOverlay);
        }, 300);
    };
    
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.querySelector('.close-button').addEventListener('click', closeModal);
    
    // Close modal when clicking outside content
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Handle download action
    modalOverlay.querySelector('.action-button').addEventListener('click', () => {
        alert('Report download feature will be implemented in the future update.');
    });
    
    // Show the modal with animation
    setTimeout(() => {
        modalOverlay.classList.add('show');
    }, 10);
}

/**
 * Creates a chart showing the contribution of each feature to the prediction in the modal
 * @param {Array} contributionsData - The feature contributions data from the server
 */
function createModalContributionsChart(contributionsData) {
    // Sort contributions by importance (descending)
    const sortedContributions = [...contributionsData].sort((a, b) => b.importance - a.importance);
    
    // Extract labels and data
    const labels = sortedContributions.map(item => item.feature);
    const data = sortedContributions.map(item => item.importance);
    
    // Generate background colors based on importance
    const backgroundColors = sortedContributions.map(item => {
        if (item.importance > 30) return 'rgba(244, 67, 54, 0.85)'; // High risk - red
        if (item.importance > 15) return 'rgba(255, 152, 0, 0.85)'; // Medium risk - orange
        if (item.importance > 5) return 'rgba(33, 150, 243, 0.85)'; // Low-medium risk - blue
        return 'rgba(76, 175, 80, 0.85)'; // Low risk - green
    });
    
    // Create horizontal bar chart
    const ctx = document.getElementById('contributionsChart').getContext('2d');
    
    // Clear any existing chart
    if (window.contributionsChart) {
        window.contributionsChart.destroy();
    }
    
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    
    window.contributionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Risk Contribution',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.85,
                categoryPercentage: 0.9
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 5,
                    left: 5
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(18, 25, 33, 0.95)',
                    titleColor: '#ffffff',
                    titleFont: {
                        weight: 'bold'
                    },
                    bodyColor: 'rgba(255, 255, 255, 0.9)',
                    bodySpacing: 4,
                    padding: 10,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 4,
                    displayColors: false,
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        label: function(context) {
                            return `Contribution: ${context.parsed.x.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Contribution (%)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                            size: 13,
                            weight: '500'
                        },
                        padding: {bottom: 5}
                    }
                },
                y: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                            weight: '500',
                            size: 12
                        }
                    },
                    title: {
                        display: false
                    }
                }
            }
        }
    });
    
    return window.contributionsChart;
}
