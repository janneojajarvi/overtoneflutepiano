(function() {
    let audioCtx;
    const grid = document.getElementById('wp-piano-grid');
    const keySelector = document.getElementById('key-selector');

    // Sävellajit ja niiden perustaajuudet (laskevassa järjestyksessä)
    const fluteKeys = [
        { id: "G2", name: "Korkea G / High G", freq: 98.00 },
        { id: "D2", name: "D (Ojajärvi vire / Default)", freq: 74.50 },
        { id: "C2", name: "C", freq: 65.41 },
        { id: "B1", name: "B", freq: 61.74 },
        { id: "Bb1", name: "Bb", freq: 58.27 },
        { id: "A1", name: "A", freq: 55.00 },
        { id: "G#1", name: "G#", freq: 51.91 },
        { id: "G1", name: "G", freq: 49.00 },
        { id: "F#1", name: "F#", freq: 46.25 },
        { id: "F1", name: "F", freq: 43.65 },
        { id: "E1", name: "E", freq: 41.20 },
        { id: "D#1", name: "D#", freq: 38.89 },
        { id: "D1", name: "Matala D / Low D", freq: 36.71 },
        { id: "C#1", name: "C#", freq: 34.65 },
        { id: "C1", name: "Matala C / Low C", freq: 32.70 }
    ];

    // Yläsävelkertoimet (Janne Ojajärven huilun pohjalta viritetyt suhteet)
    // t: 0=Open, 1=Closed, 2=Half
    const harmonics = [
        {h: 2.00, t: 0}, {h: 3.00, t: 1}, {h: 4.01, t: 0},
        {h: 4.95, t: 1}, {h: 5.71, t: 2}, {h: 6.00, t: 0},
        {h: 7.00, t: 1}, {h: 7.63, t: 2}, {h: 8.02, t: 0}, 
        {h: 9.00, t: 1}, {h: 9.42, t: 2}, {h: 9.90, t: 0}, 
        {h: 10.85, t: 1}, {h: 12.00, t: 0}, {h: 13.00, t: 1}, 
        {h: 14.00, t: 0}, {h: 15.00, t: 1}, {h: 16.00, t: 0}, 
        {h: 17.00, t: 1}, {h: 18.00, t: 0}
    ];

    // Täytetään valikko sävellajeilla
    fluteKeys.forEach(fk => {
        const option = document.createElement('option');
        option.value = fk.freq;
        option.textContent = fk.name;
        if (fk.id === "D2") option.selected = true; // Default asetus
        keySelector.appendChild(option);
    });

    // Funktio, joka laskee taajuudesta automaattisesti oikean nuotin nimen (esim. C#5)
    function getNoteName(frequency) {
        const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
        let midi = Math.round(12 * Math.log2(frequency / 440) + 69);
        let noteStr = noteNames[midi % 12];
        let octave = Math.floor(midi / 12) - 1;
        return noteStr + octave;
    }

    // Renderöi napit valitun perustaajuuden (fund) perusteella
    function renderPiano(fund) {
        grid.innerHTML = ""; // Tyhjennetään vanhat napit
        
        harmonics.forEach(note => {
            const btn = document.createElement('button');
            btn.classList.add('piano-btn');
            
            // Lasketaan juuri tämän napin taajuus ja nimi
            const noteFreq = fund * note.h;
            const dynamicNoteName = getNoteName(noteFreq);

            if(note.t === 0) { 
                btn.style.background = "#fff"; btn.style.color = "#222"; btn.style.boxShadow = "0 5px 0 #bbb";
            } else if(note.t === 1) { 
                btn.style.background = "#333"; btn.style.color = "#fff"; btn.style.boxShadow = "0 5px 0 #000"; btn.style.border = "1px solid #444";
            } else { 
                btn.style.background = "linear-gradient(135deg, #724b27 0%, #ae7744 100%)"; btn.style.color = "#fff"; btn.style.boxShadow = "0 5px 0 #4a311a";
            }

            btn.innerHTML = `<span>${note.h}</span><small>${dynamicNoteName}</small>`;

            const play = (e) => {
                e.preventDefault();
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const filter = audioCtx.createBiquadFilter();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(noteFreq, audioCtx.currentTime);

                filter.type = "lowpass";
                let filterMult = note.t === 0 ? 4 : (note.t === 2 ? 2.2 : 1.6);
                filter.frequency.setValueAtTime(noteFreq * filterMult, audioCtx.currentTime);

                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);

                osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.9);
                
                btn.style.transform = "translateY(4px)"; btn.style.boxShadow = "none";
                setTimeout(() => { 
                    btn.style.transform = "translateY(0)"; 
                    btn.style.boxShadow = note.t === 0 ? "0 5px 0 #bbb" : (note.t === 1 ? "0 5px 0 #000" : "0 5px 0 #4a311a");
                }, 100);
            };

            btn.onmousedown = play; btn.ontouchstart = play;
            grid.appendChild(btn);
        });
    }

    // Kuunnellaan pudotusvalikon muutoksia
    keySelector.addEventListener('change', (e) => {
        const newFund = parseFloat(e.target.value);
        renderPiano(newFund);
    });

    // Renderöidään aluksi oletussävellajilla (D)
    renderPiano(74.50);
})();
