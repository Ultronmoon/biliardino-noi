# Biliardino NOI — Cloudflare

Progetto pronto per Cloudflare Workers + Durable Objects.

## Deploy senza terminale
1. Crea un repository GitHub vuoto.
2. Carica nella root del repository:
   - package.json
   - wrangler.jsonc
   - cartella src con index.js
3. In Cloudflare: Workers & Pages > Create application > Connect GitHub.
4. Seleziona il repository.
5. Deploy.

Il progetto espone un unico link workers.dev.
I due giocatori aprono lo stesso link, uno crea la stanza e l'altro entra col codice.

Regola palla morta: velocità quasi zero per 5 secondi consecutivi = reset al centro.
