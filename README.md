# 🕶️ GhostVault  
**Private by Design. Powered by DAWN.**

GhostVault is a **cypherpunk dApp** for storing secrets **locally and securely** — with **no servers** and **no data tracking**.  
Built for the **DAWN Black Box**, it demonstrates how digital privacy can be reclaimed by the user, not corporations.

---

## 🚀 Project Overview

**GhostVault** is a browser-based personal vault that uses **AES-GCM encryption** to lock text directly on the client side.  
No servers are involved — all data is stored safely inside your browser’s localStorage.

Each secret can only be unlocked with your personal **passphrase**, and with **Burn After Reading** mode enabled, it self-destructs once opened — leaving no trace behind.

---

## 🧠 Core Features

- 🔐 **Local-Only Encryption** — everything happens in the browser.  
- ⚙️ **AES-GCM Encryption** — modern, fast, and secure encryption standard.  
- 🔥 **Burn After Reading** — automatically deletes secrets after decryption.  
- 🧱 **Zero Servers, Zero Logs** — fully offline by design.  
- 🛰️ **Powered by DAWN** — deployable on Black Box containers (Linux/Docker).  
- 🌒 **Cypherpunk UI** — minimalist, glowing interface for private minds.

---

## 🧰 Tech Stack

| Component | Description |
|------------|-------------|
| **Frontend** | React + TypeScript (Builder.io) |
| **Encryption** | AES-GCM via Web Crypto API |
| **Storage** | Browser `localStorage` |
| **Runtime** | Docker / Linux container compatible (DAWN Black Box) |
| **Hosting** | Netlify (can also run inside Black Box environment) |

---

## ⚙️ Run GhostVault Locally

### Option 1 — Development Mode

```bash```
git clone https://github.com/ethaga/ghostvault.git
cd ghostvault
npm install
npm run dev

Visit in your browser:
👉 http://localhost:3000

## Option 2 — Run on DAWN Black Box

### The DAWN Black Box supports Docker and Linux containers.
Build and run GhostVault as a container:

docker build -t ghostvault .
docker run -d -p 8080:80 ghostvault

Access it locally:
👉 http://<blackbox-local-ip>:8080

## 🧭 How to Use

1. Open GhostVault (ghostvault1.netlify.app)
2. Type your private message or secret.
3. Click Encrypt 🔒 → your data is locked and stored locally.
4. Enter your passphrase and click Decrypt 🔓 to unlock.
5. When Burn After Reading is enabled, your secret is deleted after viewing.


## 🧩 Integration with DAWN Black Box

### GhostVault can be deployed as:

🧱 A Docker container app inside DAWN Black Box
🕵️ A privacy layer to secure logs, credentials, or local AI data
💡 A Cypherpunk showcase demonstrating decentralized privacy tools

It illustrates the DAWN mission — empowering individuals to control their own data and connectivity.

## 🛰️ Notes for DAWN Environment

- GhostVault runs fully in-browser — no external servers or APIs required.
- Compatible with Linux containers or Docker on the DAWN Black Box.
- Ideal as a local data vault, private note locker, or encrypted key store.
- Can optionally connect to other DAWN apps (e.g., Arcium, inference.net) to protect AI or private computation logs.

## 🔥 Conclusion

### Once deployed, GhostVault becomes a privacy sandbox within the DAWN ecosystem —
showing how users can truly own and secure their data locally.





