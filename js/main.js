let logs = [];
let officeActive = true;
let climateTemp = 22;
let heatingTemp = 26;
const user = "Admin";
let temperatureChart;
let lightingChart;
let temperatureData = [];
let lightingData = [];
const maxDataPoints = 20;

document.addEventListener('DOMContentLoaded', function() {
    setupSliders();
    setupToggles();
    setupTemperatureControls();
    setupOfficeToggle();
    initCharts();
    setupBackButton();
    
    document.getElementById('climateTempControl').classList.add('visible');
    
    addChartData('temperature', climateTemp);
    addChartData('lighting', 50);
});

function setupSliders() {
    document.querySelectorAll('.slider-knob').forEach(knob => {
        knob.addEventListener('mousedown', function(e) {
            if (!officeActive) return;
            
            const slider = this.parentElement;
            const fill = slider.querySelector('.slider-fill');
            const controlItem = this.closest('.control-item');
            const controlLabel = controlItem.querySelector('.control-label').textContent;
            const valueDisplay = controlItem.querySelector('.control-value');
            
            let initialValue = parseInt(valueDisplay.textContent);
            if (isNaN(initialValue)) initialValue = 50;
            
            function moveKnob(e) {
                const rect = slider.getBoundingClientRect();
                let x = e.clientX - rect.left;
                x = Math.max(0, Math.min(x, rect.width));
                const percent = Math.round((x / rect.width) * 100);
                
                this.style.left = `${percent}%`;
                fill.style.width = `${percent}%`;
                valueDisplay.textContent = `${percent}%`;
                
                if (controlLabel.includes('Iluminación') || controlLabel.includes('Persianas') || controlLabel.includes('Ventana')) {
                    addChartData('lighting', percent);
                }
                
                addLog(`${user} - ${controlLabel} - ${percent}%`);
            }
            
            const moveHandler = moveKnob.bind(this);
            
            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', moveHandler);
            }, { once: true });
        });
    });
}

function setupToggles() {
    const climateToggle = document.getElementById('climateToggle');
    const heatingToggle = document.getElementById('heatingToggle');
    
    climateToggle.addEventListener('change', function() {
        if (!officeActive) {
            this.checked = false;
            return;
        }
        
        const climateValue = this.closest('.control-item').querySelector('.control-value');
        climateValue.textContent = this.checked ? 'On' : 'Off';
        
        document.getElementById('climateTempControl').style.display = this.checked ? 'flex' : 'none';
        
        if (this.checked) {
            heatingToggle.checked = false;
            heatingToggle.dispatchEvent(new Event('change'));
        }
        
        addLog(`${user} - Clima - ${this.checked ? 'Encendido' : 'Apagado'}`);
    });
    
    heatingToggle.addEventListener('change', function() {
        if (!officeActive) {
            this.checked = false;
            return;
        }
        
        const heatingValue = this.closest('.control-item').querySelector('.control-value');
        heatingValue.textContent = this.checked ? 'On' : 'Off';
        
        document.getElementById('heatingTempControl').style.display = this.checked ? 'flex' : 'none';
        
        if (this.checked) {
            climateToggle.checked = false;
            climateToggle.dispatchEvent(new Event('change'));
        }
        
        addLog(`${user} - Calefacción - ${this.checked ? 'Encendido' : 'Apagado'}`);
    });
}

function setupTemperatureControls() {
    const climateMinus = document.querySelector('#climateTempControl .minus');
    const climatePlus = document.querySelector('#climateTempControl .plus');
    const climateValue = document.querySelector('#climateTempControl .control-value');
    
    climateMinus.addEventListener('click', function() {
        if (!officeActive) return;
        
        let temp = parseInt(climateValue.textContent);
        if (temp > 16) {
            temp--;
            climateValue.textContent = `${temp}°`;
            addChartData('temperature', temp);
            addLog(`${user} - Temperatura Clima - ${temp}°`);
        }
    });
    
    climatePlus.addEventListener('click', function() {
        if (!officeActive) return;
        
        let temp = parseInt(climateValue.textContent);
        if (temp < 26) {
            temp++;
            climateValue.textContent = `${temp}°`;
            addChartData('temperature', temp);
            addLog(`${user} - Temperatura Clima - ${temp}°`);
        }
    });
    
    const heatingMinus = document.querySelector('#heatingTempControl .minus');
    const heatingPlus = document.querySelector('#heatingTempControl .plus');
    const heatingValue = document.querySelector('#heatingTempControl .control-value');
    
    heatingMinus.addEventListener('click', function() {
        if (!officeActive) return;
        
        let temp = parseInt(heatingValue.textContent);
        if (temp > 26) {
            temp--;
            heatingValue.textContent = `${temp}°`;
            addChartData('temperature', temp);
            addLog(`${user} - Temperatura Calefacción - ${temp}°`);
        }
    });
    
    heatingPlus.addEventListener('click', function() {
        if (!officeActive) return;
        
        let temp = parseInt(heatingValue.textContent);
        if (temp < 36) {
            temp++;
            heatingValue.textContent = `${temp}°`;
            addChartData('temperature', temp);
            addLog(`${user} - Temperatura Calefacción - ${temp}°`);
        }
    });
}

function setupOfficeToggle() {
    const officeToggle = document.getElementById('officePower');
    const officeLabel = document.getElementById('officePowerLabel');
    
    officeToggle.addEventListener('change', function() {
        officeActive = this.checked;
        officeLabel.textContent = this.checked ? 'Encendido' : 'Apagado';
        
        const officeStatus = document.querySelector('.status-value');
        officeStatus.textContent = this.checked ? 'Activa' : 'Inactiva';
        officeStatus.classList.toggle('active', this.checked);
        officeStatus.classList.toggle('inactive', !this.checked);
        
        document.querySelector('.office-detail-container').classList.toggle('office-off', !this.checked);
        
        if (!this.checked) {
            resetControls();
            addLog(`${user} - Oficina - Apagada`);
        } else {
            setDefaultValues();
            addLog(`${user} - Oficina - Encendida`);
        }
    });
}

function resetControls() {
    document.querySelectorAll('.slider-fill').forEach(fill => {
        fill.style.width = '0%';
    });
    
    document.querySelectorAll('.slider-knob').forEach(knob => {
        knob.style.left = '0%';
    });
    
    document.querySelectorAll('.control-value').forEach(value => {
        if (value.textContent.includes('%')) {
            value.textContent = '0%';
        }
    });
    
    document.getElementById('climateToggle').checked = false;
    document.getElementById('heatingToggle').checked = false;
    
    document.getElementById('climateToggle').dispatchEvent(new Event('change'));
    document.getElementById('heatingToggle').dispatchEvent(new Event('change'));
    
    addChartData('lighting', 0);
}

function setDefaultValues() {
    document.querySelectorAll('.slider-fill').forEach(fill => {
        fill.style.width = '50%';
    });
    
    document.querySelectorAll('.slider-knob').forEach(knob => {
        knob.style.left = '50%';
    });
    
    document.querySelectorAll('.control-value').forEach(value => {
        if (value.textContent.includes('%')) {
            value.textContent = '50%';
        }
    });
    
    document.querySelector('#climateTempControl .control-value').textContent = '22°';
    document.querySelector('#heatingTempControl .control-value').textContent = '26°';
    
    document.getElementById('climateToggle').checked = false;
    document.getElementById('heatingToggle').checked = false;
    document.getElementById('climateToggle').dispatchEvent(new Event('change'));
    document.getElementById('heatingToggle').dispatchEvent(new Event('change'));
    
    addChartData('lighting', 50);
    addChartData('temperature', 22);
}

function initCharts() {
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    const lightCtx = document.getElementById('lightingChart').getContext('2d');
    
    temperatureChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatura (°C)',
                data: [],
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 15,
                    suggestedMax: 36
                }
            }
        }
    });
    
    lightingChart = new Chart(lightCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Iluminación (%)',
                data: [],
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateCharts() {
    temperatureChart.update();
    lightingChart.update();
}

function addChartData(type, value) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    if (type === 'temperature') {
        temperatureData.push({
            time: timeString,
            value: value
        });
        
        if (temperatureData.length > maxDataPoints) {
            temperatureData.shift();
        }
        
        temperatureChart.data.labels = temperatureData.map(item => item.time);
        temperatureChart.data.datasets[0].data = temperatureData.map(item => item.value);
    } 
    else if (type === 'lighting') {
        lightingData.push({
            time: timeString,
            value: value
        });
        
        if (lightingData.length > maxDataPoints) {
            lightingData.shift();
        }
        
        lightingChart.data.labels = lightingData.map(item => item.time);
        lightingChart.data.datasets[0].data = lightingData.map(item => item.value);
    }
    
    updateCharts();
}

function addLog(message) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const logEntry = `${timeString} - ${message}`;
    
    logs.unshift(logEntry);
    if (logs.length > 20) logs.pop();
    
    updateLogView();
}

function updateLogView() {
    const logsList = document.getElementById('logsList');
    logsList.innerHTML = '';
    
    logs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = log;
        logsList.appendChild(entry);
    });
}

function setupBackButton() {
    document.getElementById('backButton').addEventListener('click', function() {
        window.location.href = 'home.html';
    });
}