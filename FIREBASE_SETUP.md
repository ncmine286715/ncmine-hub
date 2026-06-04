# Guia de Configuração e Regras do Firebase para NCMINE HUB

Este documento contém todas as configurações necessárias no Console do Firebase para garantir que o sistema de login, comunidade, segurança e notificações funcione corretamente.

---

### 1. Firestore Database (Regras de Segurança)

Você deve copiar este JSON e colar na aba **Rules** do seu Firestore Database. Estas regras protegem seu banco de dados contra spam, garantem a privacidade dos perfis e permitem o funcionamento do sistema de XP e curtidas.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Proteção contra spam de criação de contas
    match /system_limits/{hash} {
      allow read: if false;
      allow create: if request.auth != null;
    }

    // Perfis de Usuário (XP, Ranks e Personalização)
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && (
        request.auth.uid == userId || 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['points', 'updatedAt'])
      );
    }

    // Estatísticas globais dos Addons
    match /addons/{addonId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Comentários, Curtidas e Respostas Aninhadas
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && (
        resource.data.userId == request.auth.uid || 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'repliesCount'])
      );
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
      
      match /replies/{replyId} {
        allow read: if true;
        allow create: if request.auth != null;
      }
    }

    // Rastreamento de Curtidas
    match /likes/{likeId} {
      allow read: if true;
      allow write: if request.auth != null && likeId.startsWith(request.auth.uid);
    }

    // Favoritos
    match /favorites/{favId} {
      allow read: if true;
      allow write: if request.auth != null && favId.startsWith(request.auth.uid);
    }

    // Avaliações (Estrelas)
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if request.auth != null && ratingId.startsWith(request.auth.uid);
      allow update: if false; 
    }

    // Histórico de Downloads
    match /downloads/{dwId} {
      allow read: if true;
      allow write: if request.auth != null && dwId.startsWith(request.auth.uid);
    }

    // Notificações Globais (Apenas Admin pode criar)
    match /global_notifications/{notifId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.token.email == 'rosidomingos032@gmail.com';
    }
  }
}
```

---

### 2. Configuração do Authentication (Console do Firebase)

Para que o login com Google funcione, você **precisa** seguir estes passos no Console do Firebase:

1.  **Habilitar o Provedor Google**:
    *   No menu lateral, vá em **Authentication** > **Sign-in method**.
    *   Clique em **Add new provider**.
    *   Selecione **Google** e ative o botão **Enable**.
    *   Preencha o nome de exibição do projeto e selecione o e-mail de suporte. Clique em **Save**.

2.  **Autorizar Domínio do Cloudflare**:
    *   No **Authentication**, vá na aba **Settings** > **Authorized domains**.
    *   Clique em **Add domain**.
    *   Adicione o endereço do seu site no Cloudflare: `ncmine-hub.pages.dev` (ou seu domínio customizado). Isso é obrigatório para o login funcionar.

---

### 3. Checklist Final de Deploy
1.  **Deploy no Cloudflare Pages**: O seu código já está otimizado para build automático. Apenas certifique-se de que, se você usar variáveis de ambiente no Cloudflare, elas correspondam ao `firebaseConfig` definido em `src/lib/firebase.ts`.
2.  **Verificação de Produção**: Após o deploy, teste o login e o cadastro (escolhendo um novo nickname) para garantir que tudo está conectado corretamente.
