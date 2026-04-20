(function() {
    const fund = 74.5; // D2 perustaajuus

    // t: 0=Open(White), 1=Closed(Black), 2=Half(Brown)
    const notes = [
        {h: 2.00, n: "D3", t: 0}, 
        {h: 3.00, n: "A3", t: 1}, 
        {h: 4.01, n: "D4", t: 0},
        {h: 4.95, n: "F#4", t: 1}, 
        {h: 5.71, n: "Ab4", t: 2}, 
        {h: 6.00, n: "A4", t: 0},
        {h: 7.00, n: "C5", t: 1}, 
        {h: 7.63, n: "C#5", t: 2}, 
        {h: 8.02, n: "D5", t: 0}, 
        {h: 9.00, n: "E5", t: 1},
        {h: 9.42, n: "F5", t: 2}, 
        {h: 9.90, n: "F#5", t: 0}, 
        {h: 10.85, n: "G#5", t: 1}, 
        {h: 12.00, n: "A5", t: 0},
        {h: 13.00, n: "Bb5", t: 1}, 
        {h: 14.00, n: "C6", t: 0}, 
        {h: 15.00, n: "C#6", t: 1},
        {h: 16.00, n: "D6", t: 0}, 
        {h: 17.00, n: "E6", t: 1}, 
        {h: 18.00, n: "F#6", t: 0}
    ];
    
    let audioCtx;
    const grid = document.getElementById('wp-piano-grid');

    notes.forEach(note => {
        const btn = document.createElement('button');
        btn.classList.add('piano-btn');

        // Dynaamiset tyylit tyypin mukaan
        if(note.t === 0) { // White
            btn.style.background = "#fff"; 
            btn.style.color = "#222";
            btn.style.boxShadow = "0 5px 0 #bbb";
        } else if(note.t === 1) { // Black
            btn.style.background = "#333"; 
            btn.style.color = "#fff";
            btn.style.boxShadow = "0 5px 0 #000";
            btn.style.border = "1px solid #444";
        } else { // Brown Gradient
            btn.style.background = "linear-gradient(135deg, #724b27 0%, #ae7744 100%)";
            btn.style.color = "#fff"; 
            btn.style.boxShadow = "0 5px 0 #4a311a";
        }

        btn.innerHTML = `<span>${note.h}</span><small style="font-size:10px; opacity:0.8; margin-top:4px; font-weight:normal;">${note.n}</small>`;

        const play = (e) => {
            e.preventDefault();
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(fund * note.h, audioCtx.currentTime);

            filter.type = "lowpass";
            let filterMult = note.t === 0 ? 4 : (note.t === 2 ? 2.2 : 1.6);
            filter.frequency.setValueAtTime(fund * note.h * filterMult, audioCtx.currentTime);

            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);

            osc.connect(filter); 
            filter.connect(gain); 
            gain.connect(audioCtx.destination);

            osc.start(); 
            osc.stop(audioCtx.currentTime + 0.9);
            
            // Animointi
            btn.style.transform = "translateY(4px)"; 
            btn.style.boxShadow = "none";
            setTimeout(() => { 
                btn.style.transform = "translateY(0)"; 
                btn.style.boxShadow = note.t === 0 ? "0 5px 0 #bbb" : (note.t === 1 ? "0 5px 0 #000" : "0 5px 0 #4a311a");
            }, 100);
        };

        btn.onmousedown = play; 
        btn.ontouchstart = play;
        grid.appendChild(btn);
    });
})();