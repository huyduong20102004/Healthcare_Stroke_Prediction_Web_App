document.addEventListener('DOMContentLoaded', function() {
    // This function handles the smooth transformation of the prediction box
    function setupPredictionBoxTransformation() {
        // Wait for the prediction result to be available
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && document.querySelector('.prediction-box')) {
                    // Disconnect observer once we find the prediction box
                    observer.disconnect();
                    
                    // Get the prediction box
                    const predictionBox = document.querySelector('.prediction-box');
                    
                    // Add click event to the prediction box (excluding buttons inside)
                    predictionBox.addEventListener('click', function(e) {
                        // Prevent click if the target is a button or inside a button
                        if (e.target.closest('button')) {
                            return;
                        }
                        
                        // Prevent multiple simultaneous animations
                        if (document.querySelector('.expanding-prediction-box')) {
                            return;
                        }

                        // Lock scroll during animation to prevent jank
                        document.body.style.overflow = 'hidden';
                        
                        // Get the position and size of the prediction box before transformation
                        const rect = predictionBox.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        
                        // Create a semi-transparent overlay to improve visual focus
                        const overlay = document.createElement('div');
                        overlay.className = 'animation-overlay';
                        document.body.appendChild(overlay);
                        
                        // Store original position and dimensions for animation
                        const originalPosition = {
                            top: rect.top + scrollTop,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height
                        };
                        
                        // Clone contribution data from the original box
                        const contributionsData = JSON.parse(predictionBox.getAttribute('data-contributions') || '[]');
                        
                        // Create the expanding box with animation
                        const expandingBox = document.createElement('div');
                        expandingBox.className = 'expanding-prediction-box';
                        
                        // Apply hardware acceleration
                        expandingBox.style.willChange = 'transform, width, height, top, left';
                        expandingBox.style.transform = 'translate3d(0,0,0)';
                        
                        // Set initial position and size (important to set these before adding content to avoid reflows)
                        expandingBox.style.top = originalPosition.top + 'px';
                        expandingBox.style.left = originalPosition.left + 'px';
                        expandingBox.style.width = originalPosition.width + 'px';
                        expandingBox.style.height = originalPosition.height + 'px';
                        expandingBox.style.backgroundColor = predictionBox.style.backgroundColor;
                        expandingBox.style.boxShadow = predictionBox.style.boxShadow;
                        
                        // Set initial content as a clone of the original
                        const clonedContent = predictionBox.cloneNode(true);
                        clonedContent.style.visibility = '';
                        expandingBox.appendChild(clonedContent.firstElementChild);
                        
                        // Add to document
                        document.body.appendChild(expandingBox);
                        
                        // Hide original prediction box during animation
                        predictionBox.style.visibility = 'hidden';
                        
                        // Calculate ideal dimensions based on screen size
                        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                        const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                        
                        // Calculate ideal dimensions based on screen size, accounting for zoom
                        // Use a slightly smaller percentage on high-zoom scenarios
                        const zoomLevel = detectZoomLevel();
                        const isHighZoom = zoomLevel > 1.5;
                        
                        // Adjust percentage based on zoom level - use smaller percentages at higher zoom
                        const widthPercentage = isHighZoom ? 0.85 : 0.92;
                        const heightPercentage = isHighZoom ? 0.85 : 0.9;
                        
                        const idealWidth = Math.min(viewportWidth * widthPercentage, 1100);
                        const idealHeight = viewportHeight * heightPercentage;
                        
                        // Use requestAnimationFrame for smoother transitions
                        requestAnimationFrame(() => {
                            // Fade in overlay
                            overlay.style.opacity = '1';
                            
                            // Force a reflow before adding the transition class to ensure initial state is rendered
                            void expandingBox.offsetWidth;
                            
                            // Add expanding class to start animation
                            expandingBox.classList.add('expanding');
                            
                            // Set expanded position and dimensions
                            setTimeout(() => {
                                expandingBox.classList.add('expanded');
                                expandingBox.style.top = '50%';
                                expandingBox.style.left = '50%';
                                expandingBox.style.width = idealWidth + 'px';
                                expandingBox.style.maxWidth = '1100px';
                                expandingBox.style.height = idealHeight + 'px';
                                expandingBox.style.maxHeight = idealHeight + 'px';
                                expandingBox.style.transform = 'translate(-50%, -50%) translate3d(0,0,0)';
                                expandingBox.style.backgroundColor = '#121921';
                                expandingBox.style.display = 'flex';
                                expandingBox.style.flexDirection = 'column';
                                
                                // Add zoom-specific adjustments
                                if (isHighZoom) {
                                    expandingBox.classList.add('high-zoom');
                                }
                                
                                // Prepare for content transition after size animation is mostly complete
                                setTimeout(() => {
                                    // Don't immediately replace content - prepare it offscreen first
                                    const contentWrapper = document.createElement('div');
                                    contentWrapper.style.position = 'absolute';
                                    contentWrapper.style.visibility = 'hidden';
                                    contentWrapper.className = 'content-prepare';
                                    document.body.appendChild(contentWrapper);

                                    // Save original prediction values for smooth transition
                                    const originalRiskValue = predictionBox.querySelector('.risk-value')?.textContent || '';
                                    const originalRiskPercentage = predictionBox.querySelector('.risk-percentage')?.textContent || '';
                                    
                                    // Generate new content in the invisible element
                                    prepareExpandedContent(contentWrapper, contributionsData, (preparedContent) => {
                                        // Fade out current content
                                        expandingBox.classList.add('content-fade-out');
                                        
                                        // After fade out, swap content and fade in
                                        setTimeout(() => {
                                            expandingBox.innerHTML = preparedContent;
                                            contentWrapper.remove();
                                            
                                            // Wait for next frame to ensure the DOM has been updated
                                            requestAnimationFrame(() => {
                                                requestAnimationFrame(() => {
                                                    expandingBox.classList.remove('content-fade-out');
                                                    expandingBox.classList.add('content-fade-in');
                                                    
                                                    // Make the expanded box display flexbox to position content
                                                    const expandedBody = expandingBox.querySelector('.expanded-body');
                                                    if (expandedBody) {
                                                        expandedBody.style.flex = '1';
                                                        expandedBody.style.overflowY = 'hidden';
                                                        expandedBody.style.display = 'flex';
                                                        expandedBody.style.flexDirection = 'column';
                                                        
                                                        // Staggered animation for prediction summary first
                                                        const predictionSummary = expandingBox.querySelector('.expanded-prediction-summary');
                                                        if (predictionSummary) {
                                                            predictionSummary.style.opacity = '0';
                                                            predictionSummary.style.transform = 'translateY(-50%) translateX(-10px)';
                                                            
                                                            setTimeout(() => {
                                                                predictionSummary.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                                                                predictionSummary.style.opacity = '1';
                                                                predictionSummary.style.transform = 'translateY(-50%) translateX(0)';
                                                            }, 50);
                                                        }
                                                        
                                                        // Add nice entrance animation for content sections with staggered timing
                                                        const contentElements = expandedBody.querySelectorAll('.key-insight-section, .factors-table-container, .factor-detail-container');
                                                        contentElements.forEach((element, index) => {
                                                            element.style.opacity = '0';
                                                            element.style.transform = 'translateY(20px)';
                                                            setTimeout(() => {
                                                                element.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                                                                element.style.opacity = '1';
                                                                element.style.transform = 'translateY(0)';
                                                            }, 150 + (index * 80)); // Slightly longer delay after prediction summary animates
                                                        });
                                                        
                                                        // Ensure table container can scroll if needed at high zoom levels
                                                        const factorsTableContainer = expandedBody.querySelector('.factors-table-container');
                                                        if (factorsTableContainer) {
                                                            factorsTableContainer.style.overflowY = 'auto';
                                                        }
                                                    }
                                                    
                                                    // Setup interaction once content is visible
                                                    setupCloseButton(expandingBox, overlay, predictionBox);
                                                    setupFactorRowClicks(expandingBox);
                                                    setupZoomHandling(expandingBox);
                                                    
                                                    // Restore scroll once animation is complete
                                                    setTimeout(() => {
                                                        document.body.style.overflow = '';
                                                    }, 300);
                                                });
                                            });
                                        }, 200);
                                    });
                                }, 450); // Slightly increased delay for larger window
                            }, 20); // Small delay to ensure the expanding class has been applied
                        });
                    });
                }
            });
        });
        
        // Observe the prediction result container for changes
        observer.observe(document.getElementById('predictionResult'), { childList: true });
    }
    
    // Prepare expanded content offscreen to reduce DOM reflows
    function prepareExpandedContent(container, contributionsData, callback) {
        if (!contributionsData || contributionsData.length === 0) {
            console.error("Feature contribution data is not available for this prediction.");
            return;
        }
        
        // Get prediction data from the original box
        const originalRiskValue = container.querySelector('.risk-value')?.textContent?.trim() || '';
        const originalRiskPercentage = container.querySelector('.risk-percentage')?.textContent?.trim() || '';
        const backgroundColor = container.style.backgroundColor || '#121921';
        
        // Determine text color based on risk level
        let textColorClass = '';
        if (backgroundColor.includes('ffebee')) {
            textColorClass = 'text-danger';
        } else if (backgroundColor.includes('fff8e1')) {
            textColorClass = 'text-warning';
        } else if (backgroundColor.includes('e8f5e9')) {
            textColorClass = 'text-success';
        }
        
        // Sort contributions by importance
        const sortedContributions = [...contributionsData].sort((a, b) => b.importance - a.importance);
        const topFactor = sortedContributions[0];
        
        // Calculate the maximum contribution value for scaling
        const maxContribution = Math.max(...sortedContributions.map(item => item.importance));
        
        // Use a more compact layout to avoid scrolling, now including prediction information
        const expandedContent = `
            <div class="expanded-header">
                <div class="expanded-prediction-summary" data-original-position="true">
                    <div class="risk-summary ${textColorClass}">
                        <span class="risk-value">${originalRiskValue}</span>
                        <span class="risk-percentage">${originalRiskPercentage}</span>
                    </div>
                </div>
                <h4 class="expanded-title">
                    <i class="fas fa-percentage me-2"></i>Risk Factor Breakdown
                </h4>
                <button type="button" class="expanded-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="expanded-body">
                <div class="compact-risk-layout">
                    <div class="key-insight-section">
                        <div class="key-insight-box">
                            <div class="insight-header">
                                <h5><i class="fas fa-exclamation-circle me-2"></i>Key Risk Factor</h5>
                                <div class="key-factor">
                                    <span class="factor-name">${topFactor.feature}</span>
                                    <span class="factor-value">${topFactor.importance.toFixed(1)}%</span>
                                </div>
                            </div>
                            <p class="insight-message">${getInsightMessage(topFactor)}</p>
                        </div>
                    </div>
                    
                    <div class="factors-table-container">
                        <table class="enhanced-factors-table">
                            <thead>
                                <tr>
                                    <th width="25%">Factor</th>
                                    <th width="15%">Impact</th>
                                    <th width="60%">Contribution</th>
                                </tr>
                            </thead>
                            <tbody id="factorsTableBody">
                                ${generateFactorRows(sortedContributions, maxContribution)}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="factor-detail-container">
                        <div class="factor-detail-box" id="default-factor-detail">
                            <h6><i class="fas fa-info-circle me-2"></i>${topFactor.feature}</h6>
                            <p>${getFactorDetail(topFactor.field)}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="expanded-footer">
                <button type="button" class="btn btn-secondary expanded-close-button">
                    Close
                </button>
            </div>
        `;
        
        container.innerHTML = expandedContent;
        
        // Return the prepared content after a tiny delay to ensure rendering
        setTimeout(() => {
            callback(expandedContent);
        }, 20);
    }
    
    // Get insight message based on top factor
    function getInsightMessage(topFactor) {
        // Add actionable information based on top factor
        switch(topFactor.field) {
            case 'age':
                return 'While age cannot be modified, managing other factors can reduce overall stroke risk.';
            case 'hypertension':
                return 'Regular blood pressure monitoring and management is crucial for reducing this risk.';
            case 'heart_disease':
                return 'Following doctor\'s recommendations for heart health is essential.';
            case 'avg_glucose_level':
                return 'Diet, exercise, and medication can help manage blood sugar levels.';
            case 'bmi':
                return 'Working toward a healthy weight can significantly reduce stroke risk.';
            case 'smoking_status':
                return 'Quitting smoking can significantly reduce stroke risk over time.';
            default:
                return 'Focusing on this area can potentially reduce your overall stroke risk.';
        }
    }
    
    // Generate HTML for table rows
    function generateFactorRows(sortedContributions, maxContribution) {
        return sortedContributions.map(contribution => {
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
            
            return `
                <tr class="factor-row" data-factor="${contribution.field}">
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
                </tr>
            `;
        }).join('');
    }
    
    // Setup click events for table rows to show details
    function setupFactorRowClicks(container) {
        const rows = container.querySelectorAll('.factor-row');
        const factorDetailContainer = container.querySelector('.factor-detail-container');
        
        if (!factorDetailContainer) return;
        
        rows.forEach(row => {
            row.addEventListener('click', () => {
                // Remove active class from all rows
                rows.forEach(r => r.classList.remove('active'));
                
                // Add active class to clicked row
                row.classList.add('active');
                
                // Get the factor field
                const factorField = row.getAttribute('data-factor');
                const factorName = row.querySelector('.factor-name-cell').textContent;
                
                // Update the detail box content
                factorDetailContainer.innerHTML = `
                    <div class="factor-detail-box highlight-detail">
                        <h6><i class="fas fa-info-circle me-2"></i>${factorName}</h6>
                        <p>${getFactorDetail(factorField)}</p>
                    </div>
                `;
                
                // If we're in a high zoom state, scroll the detail into view
                if (container.classList.contains('high-zoom')) {
                    factorDetailContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
        
        // Trigger click on first row to show details initially
        if (rows.length > 0) {
            rows[0].click();
        }
    }
    
    // Get detailed information for specific factors
    function getFactorDetail(factorField) {
        switch(factorField) {
            case 'age':
                return 'Age is a non-modifiable risk factor. Stroke risk doubles each decade after 55.';
            case 'hypertension':
                return 'High blood pressure is a leading cause of stroke. Regular monitoring and treatment can help manage this risk.';
            case 'heart_disease':
                return 'Heart conditions significantly increase stroke risk. Follow your doctor\'s treatment recommendations.';
            case 'avg_glucose_level':
                return 'Elevated blood glucose can damage blood vessels over time, increasing stroke risk.';
            case 'bmi':
                return 'BMI outside the normal range (18.5-24.9) increases risk. Even modest weight loss can reduce risk.';
            case 'smoking_status':
                return 'Smoking damages blood vessels and increases clot formation risk, leading to higher stroke probability.';
            case 'work_type':
                return 'Work type can influence stress levels, physical activity, and other lifestyle factors affecting stroke risk.';
            case 'Residence_type':
                return 'Urban vs. rural living may impact access to healthcare and exposure to environmental factors.';
            case 'gender':
                return 'Gender influences stroke risk patterns. Women have some unique risk factors including pregnancy and hormone therapy.';
            case 'ever_married':
                return 'Marital status may correlate with lifestyle and social support factors that influence health outcomes.';
            default:
                return `This factor contributes to your overall stroke risk prediction.`;
        }
    }
    
    // Setup close button functionality with improved animation
    function setupCloseButton(container, overlay, predictionBox) {
        const closeButtons = container.querySelectorAll('.expanded-close, .expanded-close-button');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Clean up event listeners to prevent memory leaks
                if (container.resizeHandler) {
                    window.removeEventListener('resize', container.resizeHandler);
                }
                
                // Get original position for precise return animation
                const rect = predictionBox.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const originalPosition = {
                    top: rect.top + scrollTop,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                };
                
                // Capture the prediction summary elements before they're removed
                let riskValue = '';
                let riskPercentage = '';
                const predictionSummary = container.querySelector('.expanded-prediction-summary');
                if (predictionSummary) {
                    riskValue = predictionSummary.querySelector('.risk-value')?.textContent || '';
                    riskPercentage = predictionSummary.querySelector('.risk-percentage')?.textContent || '';
                }
                
                // Create a unified animation sequence for a seamless experience
                // First, slightly scale down with a smooth easing (preparation phase)
                container.style.transition = 'transform 0.35s cubic-bezier(0.32, 0.72, 0.18, 1.0), opacity 0.35s ease';
                container.style.transform = 'translate(-50%, -50%) scale(0.98) translate3d(0,0,0)';
                container.style.opacity = '0.98';
                
                // Begin content fade out with a quick transition
                container.classList.add('content-fade-out');
                container.classList.remove('content-fade-in');
                
                // Start overlay fade out with synchronized timing
                overlay.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
                
                // After short delay for content fade, start morphing animation
                setTimeout(() => {
                    // Prepare for shape morphing - swap content back to original
                    container.innerHTML = predictionBox.innerHTML;
                    
                    // If needed, ensure the prediction percentage is still visible
                    const originalRiskValue = container.querySelector('.risk-value');
                    const originalRiskPercentage = container.querySelector('.risk-percentage');
                    if (originalRiskValue && riskValue) {
                        originalRiskValue.textContent = riskValue;
                    }
                    if (originalRiskPercentage && riskPercentage) {
                        originalRiskPercentage.textContent = riskPercentage;
                    }
                    
                    // Match styling with the original box
                    container.style.backgroundColor = predictionBox.style.backgroundColor;
                    container.style.boxShadow = predictionBox.style.boxShadow;
                    container.style.display = '';
                    container.style.flexDirection = '';
                    
                    // Force a reflow before animation starts
                    void container.offsetWidth;
                    
                    // Start overlay fade synchronously with the morphing
                    overlay.style.opacity = '0';
                    
                    // Use the same easing as the open animation but in reverse for perceptual consistency
                    container.style.transition = 'all 0.65s cubic-bezier(0.32, 0.72, 0.24, 1.02)';
                    
                    // Remove expanded state to trigger transition
                    container.classList.remove('expanded');
                    
                    // Transform back to original position with GPU acceleration
                    requestAnimationFrame(() => {
                        container.style.transform = 'translate(0, 0) scale(1) translate3d(0,0,0)';
                        container.style.top = originalPosition.top + 'px';
                        container.style.left = originalPosition.left + 'px';
                        container.style.width = originalPosition.width + 'px';
                        container.style.height = originalPosition.height + 'px';
                        
                        // Fade to transparent near the end of the animation
                        setTimeout(() => {
                            container.style.opacity = '0';
                        }, 350); // Add slight delay before disappearing for smoother visual
                        
                        // After animation completes, clean up elements
                        setTimeout(() => {
                            // Remove elements from DOM
                            container.remove();
                            overlay.remove();
                            
                            // Restore visibility of original box
                            predictionBox.style.visibility = 'visible';
                            
                            // Add a subtle pulse to original box for visual feedback
                            predictionBox.classList.add('pulse-after-return');
                            setTimeout(() => {
                                predictionBox.classList.remove('pulse-after-return');
                            }, 1000);
                        }, 650); // Timing aligned with transition duration
                    });
                }, 120); // Shorter initial delay for more responsive feel
            });
        });
    }
    
    // Add a helper function to detect zoom level more accurately
    function detectZoomLevel() {
        const ratio = window.devicePixelRatio || 1;
        
        // Check if devicePixelRatio is available and reliable
        if (ratio !== 1) {
            return ratio;
        }
        
        // Fallback detection method
        const screen = window.screen;
        const ua = navigator.userAgent.toLowerCase();
        
        if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
            const zoomLevel = window.outerWidth / window.innerWidth;
            return Math.round(zoomLevel * 100) / 100;
        }
        
        return 1;
    }
    
    // Handle zoom changes while the modal is open
    function setupZoomHandling(container) {
        // Initial zoom level detection
        let lastZoomLevel = detectZoomLevel();
        let isHighZoom = lastZoomLevel > 1.5;
        
        // Update zoom-specific classes initially
        if (isHighZoom) {
            container.classList.add('high-zoom');
        } else {
            container.classList.remove('high-zoom');
        }
        
        // Add resize event listener to detect zoom changes
        const resizeHandler = () => {
            const currentZoomLevel = detectZoomLevel();
            
            // Check if zoom level changed significantly
            if (Math.abs(currentZoomLevel - lastZoomLevel) > 0.1) {
                lastZoomLevel = currentZoomLevel;
                isHighZoom = currentZoomLevel > 1.5;
                
                // Update classes based on zoom level
                if (isHighZoom) {
                    container.classList.add('high-zoom');
                    
                    // Enable scrolling for table container at high zoom
                    const factorsTableContainer = container.querySelector('.factors-table-container');
                    if (factorsTableContainer) {
                        factorsTableContainer.classList.add('scroll-visible-on-zoom');
                    }
                    
                    // Adjust expanded body for scrolling
                    const expandedBody = container.querySelector('.expanded-body');
                    if (expandedBody) {
                        expandedBody.style.overflowY = 'auto';
                    }
                } else {
                    container.classList.remove('high-zoom');
                    
                    // Reset scrolling for table container at normal zoom
                    const factorsTableContainer = container.querySelector('.factors-table-container');
                    if (factorsTableContainer) {
                        factorsTableContainer.classList.remove('scroll-visible-on-zoom');
                    }
                }
                
                // Adjust text size at very high zoom
                if (currentZoomLevel > 2) {
                    container.querySelectorAll('.expanded-title, .insight-message, .factor-detail-box p, .enhanced-factors-table th, .enhanced-factors-table td')
                        .forEach(el => el.classList.add('smaller-text-on-zoom'));
                } else {
                    container.querySelectorAll('.smaller-text-on-zoom')
                        .forEach(el => el.classList.remove('smaller-text-on-zoom'));
                }
            }
            
            // Also adjust the modal size on window resize (regardless of zoom)
            const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            
            const widthPercentage = isHighZoom ? 0.85 : 0.92;
            const heightPercentage = isHighZoom ? 0.85 : 0.9;
            
            const idealWidth = Math.min(viewportWidth * widthPercentage, 1100);
            const idealHeight = viewportHeight * heightPercentage;
            
            // Update the box dimensions to maintain the proportional size
            container.style.width = idealWidth + 'px';
            container.style.height = idealHeight + 'px';
            container.style.maxHeight = idealHeight + 'px';
        };
        
        // Add the event listener
        window.addEventListener('resize', resizeHandler);
        
        // Store the handler on the container so we can remove it on close
        container.resizeHandler = resizeHandler;
    }
    
    // Initialize the transformation setup
    setupPredictionBoxTransformation();
}); 