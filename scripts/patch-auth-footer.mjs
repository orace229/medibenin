import { readFileSync, writeFileSync } from 'fs';

const file = 'src/components/AuthPages.tsx';
const data = readFileSync(file, 'utf8');

const idx = data.lastIndexOf('<footer');
const oldFooter = data.slice(idx);

const newFooter = `<footer className="text-center text-[11px] text-white/70 lg:text-[#94A3B8] px-4">
          <p>{isFr ? 'Données 100 % synthétiques · Prototype indépendant.' : '100% synthetic data · Independent prototype.'}</p>
        </footer>
      </div>
    </div>
  );
};`;

const result = data.slice(0, idx) + newFooter;
writeFileSync(file, result, 'utf8');
console.log('AuthPages footer patched.');
