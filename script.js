class TimerWidget {
  constructor(container, hours) {
    this.container = container;
    this.hours = hours;
    this.intervalMs = hours * 60 * 60 * 1000;

    this.ref = doc(db, "timers", `${hours}h`);

    this.btn = container.querySelector('.mark-btn');
    this.lastEl = container.querySelector('.last');
    this.elapsedEl = container.querySelector('.elapsed');
    this.remainingEl = container.querySelector('.remaining');
    this.lockInfoEl = container.querySelector('.lock-info');
    this.btnClock = container.querySelector('.btn-clock');
    this.btnLock = container.querySelector('.btn-lock');
    this.resetBtn = container.querySelector('.reset-btn');

    this.ts = null;
    this.lockUntil = null;

    this.bind();
    this.load().then(() => this.startTicker());
  }

  bind(){
    this.btn.addEventListener('click', ()=> this.mark());
    if(this.resetBtn) this.resetBtn.addEventListener('click', ()=> this.reset());
  }

  async load(){
    const snap = await getDoc(this.ref);
    if(snap.exists()){
      const data = snap.data();
      this.ts = data.ts || null;
      this.lockUntil = data.lockUntil || null;
    }
    this.updateButtons();
  }

  async save(){
    await setDoc(this.ref, {
      ts: this.ts,
      lockUntil: this.lockUntil
    });
  }

  async mark(){
    this.ts = Date.now();
    this.lockUntil = Date.now() + 3*60*1000;
    await this.save();
    this.updateButtons();
    this.tick();
  }

  async reset(){
    this.ts = null;
    this.lockUntil = null;
    await this.save();
    this.updateButtons();
    this.tick();
  }

  updateButtons(){
    if(this.lockUntil && Date.now() < this.lockUntil){
      this.btn.disabled = true;
    } else {
      this.btn.disabled = false;
      this.lockUntil = null;
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
      this.lastEl.textContent = new Date(this.ts).toLocaleTimeString();
      this.elapsedEl.textContent = formatMs(now - this.ts);

      const remainingMs = (this.ts + this.intervalMs) - now;
      this.remainingEl.textContent =
        remainingMs >= 0 ? formatMs(remainingMs) : `Vencido ${formatMs(Math.abs(remainingMs))}`;
    }

    if(this.lockUntil){
      const left = Math.max(0, this.lockUntil - now);
      this.lockInfoEl.textContent = `Pode marcar novamente em ${formatMs(left)}`;
    } else {
      this.lockInfoEl.textContent = '';
    }

    if(this.btnClock){
      if(this.lockUntil && Date.now() < this.lockUntil){
        this.btnClock.textContent = ` ${formatMs(this.lockUntil - now)}`;
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
  const t = Math.floor(ms/1000);
  return `${pad(Math.floor(t/3600))}:${pad(Math.floor(t/60)%60)}:${pad(t%60)}`;
}
function formatCurrentTime(){
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  new TimerWidget(document.getElementById('timer-6h'), 6);
  new TimerWidget(document.getElementById('timer-8h'), 8);
});
