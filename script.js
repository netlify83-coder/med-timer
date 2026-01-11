class TimerWidget {
  constructor(container, hours) {
    this.container = container;
    this.hours = hours;
    this.key = `timer-${hours}h-ts`;
    this.lockKey = `timer-${hours}h-lock`;

    this.btn = container.querySelector('.mark-btn');
    this.lastEl = container.querySelector('.last');
    this.elapsedEl = container.querySelector('.elapsed');
    this.remainingEl = container.querySelector('.remaining');
    this.lockInfoEl = container.querySelector('.lock-info');
    this.btnClock = container.querySelector('.btn-clock');
    this.btnLock = container.querySelector('.btn-lock');
    this.resetBtn = container.querySelector('.reset-btn');

    this.intervalMs = hours * 60 * 60 * 1000;

    this.ts = null;
    this.lockUntil = null;

    this.load();
    this.bind();
    this.startTicker();
  }


  bind(){
    this.btn.addEventListener('click', ()=> this.mark());
    if(this.resetBtn) this.resetBtn.addEventListener('click', ()=> this.reset());
  }

  reset(){
    this.ts = null;
    this.save();
    this.lockUntil = null;
    localStorage.removeItem(this.lockKey);
    this.updateButtons();
    this.tick();
  }

  load(){
    const raw = localStorage.getItem(this.key);
    if(raw) this.ts = parseInt(raw,10);
    const lockRaw = localStorage.getItem(this.lockKey);
    if(lockRaw) this.lockUntil = parseInt(lockRaw,10);
    if(this.lockUntil && Date.now() >= this.lockUntil){
      this.lockUntil = null;
      localStorage.removeItem(this.lockKey);
    }
    this.updateButtons();
  }

  save(){
    if(this.ts) localStorage.setItem(this.key, String(this.ts));
    else localStorage.removeItem(this.key);
  }

  mark(){
    this.ts = Date.now();
    this.save();

    // bloquear botão por 3 minutos para evitar múltiplas marcações
    this.lockUntil = Date.now() + 3*60*1000;
    localStorage.setItem(this.lockKey, String(this.lockUntil));
    this.updateButtons();
    this.tick();
  }

  updateButtons(){
    if(this.lockUntil && Date.now() < this.lockUntil){
      this.btn.disabled = true;
    } else {
      this.btn.disabled = false;
      this.lockUntil = null;
      localStorage.removeItem(this.lockKey);
    }
  }

  startTicker(){
    this.tick();
    this._timer = setInterval(()=> this.tick(), 1000);
  }

  tick(){
    const now = Date.now();
    this.updateButtons();

    if(!this.ts){
      this.lastEl.textContent = '—';
      this.elapsedEl.textContent = '—';
      this.remainingEl.textContent = '—';
    } else {
      const last = new Date(this.ts);
      this.lastEl.textContent = last.toLocaleTimeString();

      const elapsedMs = now - this.ts;
      this.elapsedEl.textContent = formatMs(elapsedMs);

      const nextDue = this.ts + this.intervalMs;
      const remainingMs = nextDue - now;
      if(remainingMs >= 0){
        this.remainingEl.textContent = formatMs(remainingMs);
      } else {
        // tempo já passou — mostrar tempo desde venceu
        this.remainingEl.textContent = `Vencido ${formatMs(Math.abs(remainingMs))}`;
      }
    }

    if(this.lockUntil){
      const left = Math.max(0, this.lockUntil - now);
      this.lockInfoEl.textContent = `Pode marcar novamente em ${formatMs(left)}`;
    } else {
      this.lockInfoEl.textContent = '';
    }

    // atualizar relógio no botão e estado visual de bloqueio
    if(this.btnClock){
      if(this.lockUntil && Date.now() < this.lockUntil){
        const left = Math.max(0, this.lockUntil - now);
        this.btnClock.textContent = ` ${formatMs(left)}`;
        if(this.btnLock) this.btnLock.textContent = '🔒';
        this.btn.classList.add('locked');
      } else {
        this.btnClock.textContent = formatCurrentTime();
        if(this.btnLock) this.btnLock.textContent = '🔓';
        this.btn.classList.remove('locked');
      }
    }
  }
}

function pad(n){return n.toString().padStart(2,'0');}

function formatMs(ms){
  const total = Math.floor(ms/1000);
  const s = total % 60;
  const m = Math.floor(total/60) % 60;
  const h = Math.floor(total/3600);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const c6 = document.getElementById('timer-6h');
  const c8 = document.getElementById('timer-8h');
  new TimerWidget(c6, 6);
  new TimerWidget(c8, 8);
});

function formatCurrentTime(){
  const d = new Date();
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${h}:${m}:${s}`;
}
