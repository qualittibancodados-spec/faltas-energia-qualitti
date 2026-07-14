// Service Worker - Controle de Faltas de Energia (Qualitti)
// Cuida do cache básico dos arquivos do app, permitindo que o formulário
// abra mesmo com internet instável (o envio dos dados ainda precisa de rede).

const CACHE_NAME = "faltas-energia-qualitti-v1";
const ARQUIVOS_PARA_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// Instala e guarda os arquivos essenciais em cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE))
  );
  self.skipWaiting();
});

// Remove caches antigos quando uma nova versão é publicada
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

// Estratégia: tenta a rede primeiro (pra sempre pegar a versão mais nova);
// se estiver offline, usa o que tiver salvo em cache.
self.addEventListener("fetch", (event) => {
  // Nunca cacheia chamadas para o Google Apps Script (envio de dados precisa ser sempre "ao vivo")
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return resposta;
      })
      .catch(() => caches.match(event.request))
  );
});
