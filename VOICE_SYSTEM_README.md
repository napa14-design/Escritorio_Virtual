# 🎤 Sistema de Voz por Proximidade - Escritório Virtual

Sistema completo de comunicação de voz/vídeo por proximidade para o Escritório Virtual Isométrico, inspirado no Gather.town.

## 🌟 Características Implementadas

### ✅ Fase 2 - Comunicação (COMPLETA)

1. **WebRTC Peer-to-Peer Funcional**
   - Conexões diretas entre usuários usando SimplePeer
   - Sinalização via Socket.io
   - Suporte a áudio e vídeo
   - Reconexão automática

2. **Volume Dinâmico por Distância**
   - Cálculo em tempo real baseado em posição no grid
   - Fade gradual de volume (4-8 tiles)
   - Web Audio API para controle preciso de ganho
   - Atualização a cada 100ms para suavidade

3. **Indicador Visual de "Falando"**
   - Círculo pulsante verde ao redor do avatar
   - Detecção de atividade de voz (VAD)
   - Animação suave e responsiva
   - Funciona para usuário local e remotos

4. **Painel de Vídeos dos Próximos**
   - Mini-vídeos no canto da tela
   - Mostra até 4 usuários próximos
   - Indicadores de distância e volume
   - Controles de expandir/fechar
   - Layout responsivo

## 📦 Arquitetura

### Frontend (React + Phaser)

```
src/
├── hooks/
│   ├── useWebRTC.js                    # Gerencia conexões WebRTC
│   ├── useProximityVoice.js            # Calcula volumes por distância
│   └── useVoiceActivityDetection.js    # Detecta quando usuários falam
├── systems/
│   └── NetworkManager.js               # Sincronização Socket.io
├── components/
│   └── VoiceManager.jsx                # Orquestra todo o sistema de voz
├── ui/
│   ├── AudioControls.jsx               # Controles de mute/vídeo
│   └── ProximityVideoPanel.jsx         # Painel de vídeos próximos
└── entities/
    └── Avatar.js                       # Avatar com indicador de fala
```

### Backend (Node.js)

```
server/
├── signalingServer.js                  # Servidor Socket.io + WebRTC
└── package.json
```

## 🚀 Como Rodar

### 1. Instalar Dependências

```bash
# Dependências do cliente (já instaladas)
npm install

# Dependências do servidor
cd server
npm install
cd ..
```

### 2. Iniciar Servidor de Sinalização

Em um terminal:

```bash
cd server
npm start
```

O servidor rodará em `http://localhost:3001`

### 3. Iniciar Cliente

Em outro terminal:

```bash
npm run dev
```

O cliente rodará em `http://localhost:5173`

### 4. Testar com Múltiplos Usuários

Abra múltiplas abas do navegador em `http://localhost:5173` para simular vários usuários.

**IMPORTANTE**: Você precisa permitir acesso ao microfone/câmera no navegador.

## 🎮 Controles

### Teclado
- **M** - Mute/Unmute microfone
- **V** - Ligar/desligar câmera
- **Space** (segurar) - Push-to-talk (se estiver mudo)
- **Tab** - Abrir menu

### Interface
- **Barra Inferior** - Controles de áudio/vídeo
- **Canto Superior Direito** - Vídeos de usuários próximos
- **Círculo Verde** ao redor do avatar - Usuário está falando

## 🔧 Configuração

### Alcance de Voz (src/hooks/useProximityVoice.js)

```javascript
export const DEFAULT_PROXIMITY_CONFIG = {
  maxDistance: 8,          // Distância máxima (tiles)
  fadeStartDistance: 4,    // Onde começa o fade
  minVolume: 0.05,         // Volume mínimo
  updateInterval: 100,     // Atualização (ms)
};
```

### Detecção de Voz (src/hooks/useVoiceActivityDetection.js)

```javascript
const DEFAULT_VAD_CONFIG = {
  threshold: 0.02,         // Sensibilidade
  smoothingFrames: 5,      // Suavização
  silenceDelay: 500,       // Delay para parar (ms)
  fftSize: 256,            // Resolução FFT
};
```

### Servidor (server/signalingServer.js)

```javascript
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
```

## 🧪 Testando o Sistema

### Teste Básico
1. Abra 2 abas do navegador
2. Entre com nomes diferentes
3. Mova os avatares próximos um do outro
4. Fale no microfone - você deve ver o círculo verde
5. O outro usuário deve ouvir com volume baseado na distância

### Teste de Proximidade
1. Mova o avatar para perto de outro usuário (< 4 tiles)
   - Volume deve estar em 100%
2. Afaste-se gradualmente (4-8 tiles)
   - Volume deve diminuir proporcionalmente
3. Afaste-se completamente (> 8 tiles)
   - Áudio deve silenciar totalmente

### Teste de Vídeo
1. Clique no botão de vídeo (📹)
2. Mova-se próximo a outro usuário
3. O vídeo deve aparecer no painel do canto superior direito
4. Clique em expandir para ver em tamanho maior

## 🐛 Troubleshooting

### Áudio não funciona
- Verifique se permitiu acesso ao microfone
- Abra DevTools e veja o console por erros
- Teste em Chrome/Edge (melhor suporte WebRTC)

### Vídeo não aparece
- Certifique-se que o vídeo está habilitado (botão verde)
- Verifique distância entre usuários (< 8 tiles)
- Veja logs do navegador

### Usuários não se conectam
- Verifique se o servidor está rodando
- Confirme que ambos estão conectados ao servidor
- Veja logs do servidor no terminal

### Volume não muda com distância
- Certifique-se que ambos usuários estão na mesma sala
- Verifique se o NetworkManager está sincronizando posições
- Abra console e veja logs de proximidade

## 📊 Logs de Debug

### Cliente
Abra DevTools (F12) e veja:
- `Connected to server: <id>` - Conexão estabelecida
- `Creating peer connection with <id>` - Iniciando WebRTC
- `Received remote stream from <id>` - Stream recebido
- `Added remote avatar: <name>` - Avatar criado

### Servidor
No terminal do servidor:
- `✅ User connected: <id>` - Novo usuário
- `👤 <id> joining room: <room>` - Entrando na sala
- `🔄 Relaying WebRTC signal` - Sinalizando WebRTC
- `📊 Status: X room(s)` - Status periódico

## 🎯 Próximas Melhorias (Fase 3 & 4)

### Fase 3 - Zonas (Pendente)
- [ ] Salas privadas de reunião
- [ ] Zona de apresentação (spotlight)
- [ ] Zona silenciosa (quiet zone)
- [ ] Detecção automática de zona

### Fase 4 - Polish (Pendente)
- [ ] Screen sharing
- [ ] Chat com bolhas sobre avatares
- [ ] Customização de avatar (UI)
- [ ] Persistência de preferências
- [ ] Configurações de dispositivos (input/output)
- [ ] Push-to-talk
- [ ] Filtros de ruído avançados

## 📝 Notas Técnicas

### Performance
- WebRTC usa conexões P2P diretas (baixa latência)
- Cálculo de proximidade otimizado (100ms updates)
- Web Audio API para processamento eficiente
- SimplePeer gerencia automaticamente ICE/STUN

### Segurança
- Servidor apenas faz sinalização (não processa áudio/vídeo)
- Streams são criptografados end-to-end (WebRTC nativo)
- CORS configurado para domínios específicos

### Compatibilidade
- **Chrome/Edge**: ✅ Suporte completo
- **Firefox**: ✅ Suporte completo
- **Safari**: ⚠️  Pode ter limitações WebRTC
- **Mobile**: ⚠️  Suporte limitado

## 🤝 Contribuindo

Para adicionar novas funcionalidades:

1. **Hooks** - Lógica reutilizável de voz/rede
2. **Components** - UI e orquestração
3. **Systems** - Managers e serviços
4. **Server** - Endpoints de sinalização

## 📄 Licença

Projeto educacional - Use livremente!

---

**Desenvolvido com ❤️ usando React, Phaser, WebRTC e Socket.io**
