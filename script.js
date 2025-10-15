const units=document.getElementById('units');
const metricInputs=document.getElementById('metricInputs');
const imperialInputs=document.getElementById('imperialInputs');
const calcBtn=document.getElementById('calcBtn');
const resetBtn=document.getElementById('resetBtn');
const resultDiv=document.getElementById('result');
const copyBtn=document.getElementById('copyBtn');
const shareBtn=document.getElementById('shareBtn');
const saveBtn=document.getElementById('saveBtn');
const historyWrap=document.getElementById('historyWrap');
const historyList=document.getElementById('history');
const clearHistoryBtn=document.getElementById('clearHistoryBtn');
document.getElementById('year').textContent=new Date().getFullYear();

units.addEventListener('change',()=>{
  if(units.value==='metric'){metricInputs.classList.remove('hidden');imperialInputs.classList.add('hidden');}
  else{metricInputs.classList.add('hidden');imperialInputs.classList.remove('hidden');}
});

function showMessage(msg,isError=false){resultDiv.textContent=msg;resultDiv.style.color=isError?'crimson':'inherit';resultDiv.style.opacity=1;setTimeout(()=>{resultDiv.style.opacity=0.95;},10);}

function classifyBMI(bmi){if(bmi<18.5)return'Underweight';if(bmi<25)return'Normal';if(bmi<30)return'Overweight';return'Obese';}
function calcMetric(w,hCm){const h=hCm/100;return w/(h*h);}
function calcImperial(lb,ft,inch){const totalInches=ft*12+inch;const meters=totalInches*0.0254;const kg=lb*0.45359237;return kg/(meters*meters);}

calcBtn.addEventListener('click',()=>{
  let bmi;
  if(units.value==='metric'){
    const w=parseFloat(document.getElementById('weightKg').value);
    const h=parseFloat(document.getElementById('heightCm').value);
    if(!w||!h||w<=0||h<=0){showMessage('Please enter valid metric values',true);return;}
    bmi=calcMetric(w,h);
  }else{
    const lb=parseFloat(document.getElementById('weightLb').value);
    const ft=parseFloat(document.getElementById('heightFt').value);
    const inch=parseFloat(document.getElementById('heightIn').value)||0;
    if(!lb||!ft||lb<=0||ft<0){showMessage('Please enter valid imperial values',true);return;}
    bmi=calcImperial(lb,ft,inch);
  }
  bmi=parseFloat(bmi.toFixed(2));
  const cat=classifyBMI(bmi);
  const message=`BMI: ${bmi} — ${cat}`;
  showMessage(message);
  resultDiv.dataset.last=JSON.stringify({bmi,cat,ts:Date.now(),units:units.value});
});

resetBtn.addEventListener('click',()=>{document.querySelectorAll('input').forEach(i=>i.value='');showMessage('');});

copyBtn.addEventListener('click',async()=>{
  const last=resultDiv.dataset.last;
  if(!last){showMessage('No result to copy',true);return;}
  try{await navigator.clipboard.writeText(JSON.parse(last).bmi+' BMI');showMessage('Result copied');}catch(e){showMessage('Copy failed',true);}
});

shareBtn.addEventListener('click',async()=>{
  const last=resultDiv.dataset.last;
  if(!last){showMessage('No result to share',true);return;}
  const obj=JSON.parse(last);
  const text=`My BMI is ${obj.bmi} (${obj.cat}). Try this free BMI tool!`;
  if(navigator.share){try{await navigator.share({title:'BMI Result',text});showMessage('Shared!');}catch(e){showMessage('Share cancelled',true);}
  }else{await navigator.clipboard.writeText(text);showMessage('Share text copied');}
});

function loadHistory(){
  const data=JSON.parse(localStorage.getItem('bmi_history')||'[]');
  historyList.innerHTML='';
  if(data.length===0){historyWrap.classList.add('hidden');return;}
  historyWrap.classList.remove('hidden');
  data.slice().reverse().forEach(item=>{
    const li=document.createElement('li');
    const time=new Date(item.ts).toLocaleString();
    li.textContent=`${item.bmi} — ${item.cat} (${item.units}) — ${time}`;
    historyList.appendChild(li);
  });
}

saveBtn.addEventListener('click',()=>{
  const last=resultDiv.dataset.last;
  if(!last){showMessage('No result to save',true);return;}
  const data=JSON.parse(localStorage.getItem('bmi_history')||'[]');
  data.push(JSON.parse(last));
  localStorage.setItem('bmi_history',JSON.stringify(data.slice(-50)));
  loadHistory();
  showMessage('Saved to local history');
});

clearHistoryBtn.addEventListener('click',()=>{localStorage.removeItem('bmi_history');loadHistory();showMessage('History cleared');});

loadHistory();
