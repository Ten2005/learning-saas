# Learning SaaS - API Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Type Definitions](#type-definitions)
3. [Store APIs (State Management)](#store-apis-state-management)
4. [Utility Functions](#utility-functions)
5. [API Routes](#api-routes)
6. [Components](#components)
7. [Constants](#constants)
8. [Configuration](#configuration)

## Project Overview

Learning SaaS is a Next.js 15 application that provides AI-powered chat functionality with conversation management, mind mapping visualization, and user authentication. The application uses:

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **AI Integration**: OpenRouter API
- **Visualization**: ReactFlow for mind maps

## Type Definitions

### Core Types (`types/index.ts`)

#### `Message`
Represents a chat message in the UI.

```typescript
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}
```

**Usage:**
```typescript
const message: Message = {
  id: "123",
  content: "Hello, how can I help you?",
  role: "assistant",
  timestamp: new Date()
};
```

#### `ChatMessage`
Simplified message format for API communication.

```typescript
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
```

#### `Conversation`
Represents a conversation stored in the database.

```typescript
interface Conversation {
  id: string;
  user_id: string;
  started_at: string;
  is_deleted: boolean;
  title: string | null;
  model: string;
  system_prompt: string | null;
  language: string;
}
```

#### `MessageRecord`
Database representation of a message with branching support.

```typescript
interface MessageRecord {
  id: string;
  conversation_id: string;
  parent_id: string | null;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  is_deleted: boolean;
}
```

## Store APIs (State Management)

### Authentication Store (`stores/authStore.ts`)

#### `useAuthStore`

Manages user authentication state using Supabase.

**State:**
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: { unsubscribe: () => void } | null;
}
```

**Actions:**

##### `initialize(): Promise<void>`
Initializes authentication state and sets up auth listener.

```typescript
const { initialize } = useAuthStore();
await initialize();
```

##### `signOut(): Promise<void>`
Signs out the current user.

```typescript
const { signOut } = useAuthStore();
await signOut();
```

##### `setUser(user: User | null): void`
Sets the current user.

```typescript
const { setUser } = useAuthStore();
setUser(user);
```

##### `cleanup(): void`
Cleans up auth subscriptions.

```typescript
const { cleanup } = useAuthStore();
cleanup();
```

### Chat Store (`stores/chatStore.ts`)

#### `useChatStore`

Manages chat messages with branching conversation support.

**State:**
```typescript
interface ChatState {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  lastMessageId: string | null;
  currentPath: string[];
  branchPointId: string | null;
  availableBranches: Map<string, MessageRecord[]>;
}
```

**Actions:**

##### `sendMessage(content: string, conversationId: string): Promise<void>`
Sends a message and gets AI response.

```typescript
const { sendMessage } = useChatStore();
await sendMessage("Hello!", conversationId);
```

##### `sendMessageFromBranch(content: string, parentId: string, conversationId: string): Promise<void>`
Sends a message from a specific branch point.

```typescript
const { sendMessageFromBranch } = useChatStore();
await sendMessageFromBranch("Alternative response", parentId, conversationId);
```

##### `loadMessagesForConversation(conversationId: string): Promise<void>`
Loads messages for a specific conversation.

```typescript
const { loadMessagesForConversation } = useChatStore();
await loadMessagesForConversation(conversationId);
```

##### `switchToBranch(branchPath: string[], conversationId: string): void`
Switches to a different conversation branch.

```typescript
const { switchToBranch } = useChatStore();
switchToBranch(["msg1", "msg2", "msg3"], conversationId);
```

### Conversation Store (`stores/conversationStore.ts`)

#### `useConversationStore`

Manages conversation list and current conversation.

**State:**
```typescript
interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
}
```

**Actions:**

##### `fetchConversations(): Promise<void>`
Fetches all conversations for the current user.

```typescript
const { fetchConversations } = useConversationStore();
await fetchConversations();
```

##### `createNewConversation(title?: string): Promise<string | null>`
Creates a new conversation.

```typescript
const { createNewConversation } = useConversationStore();
const conversationId = await createNewConversation("My new chat");
```

##### `deleteConversation(id: string): Promise<boolean>`
Deletes a conversation.

```typescript
const { deleteConversation } = useConversationStore();
const success = await deleteConversation(conversationId);
```

### Mind Map Store (`stores/mindMapStore.ts`)

#### `useMindMapStore`

Manages ReactFlow mind map visualization of conversations.

**State:**
```typescript
interface MindMapState {
  nodes: Node[];
  edges: Edge[];
  loading: boolean;
}
```

**Actions:**

##### `createMindMapFromMessages(messages: MessageRecord[]): void`
Creates a mind map visualization from conversation messages.

```typescript
const { createMindMapFromMessages } = useMindMapStore();
createMindMapFromMessages(messages);
```

##### `onNodesChange(changes: NodeChange[]): void`
Handles node changes in the mind map.

```typescript
const { onNodesChange } = useMindMapStore();
onNodesChange(changes);
```

### UI Store (`stores/uiStore.ts`)

#### `useUIStore`

Manages UI state like modals, sidebar, and menus.

**State:**
```typescript
interface UIState {
  sidebarOpen: boolean;
  showLogoutConfirmModal: boolean;
  showDeleteConversationModal: boolean;
  conversationToDelete: { id: string; title: string } | null;
  // ... other UI states
}
```

**Actions:**

##### `toggleSidebar(): void`
Toggles the sidebar open/closed state.

```typescript
const { toggleSidebar } = useUIStore();
toggleSidebar();
```

##### `setShowLogoutConfirmModal(show: boolean): void`
Shows/hides the logout confirmation modal.

```typescript
const { setShowLogoutConfirmModal } = useUIStore();
setShowLogoutConfirmModal(true);
```

### Form Store (`stores/formStore.ts`)

#### `useFormStore`

Manages authentication form state.

**State:**
```typescript
interface FormState {
  loginEmail: string;
  loginPassword: string;
  loginError: string;
  loginLoading: boolean;
  signupEmail: string;
  signupPassword: string;
  // ... other form fields
}
```

**Actions:**

##### `setLoginEmail(email: string): void`
Sets the login email field.

```typescript
const { setLoginEmail } = useFormStore();
setLoginEmail("user@example.com");
```

##### `resetLoginForm(): void`
Resets all login form fields.

```typescript
const { resetLoginForm } = useFormStore();
resetLoginForm();
```

## Utility Functions

### `lib/utils.ts`

#### `cn(...inputs: ClassValue[]): string`
Combines and merges Tailwind CSS classes using clsx and tailwind-merge.

```typescript
import { cn } from "@/lib/utils";

const className = cn(
  "base-class",
  isActive && "active-class",
  "another-class"
);
```

### `utils/getResponse.ts`

#### `getResponse(messages: ChatMessage[], model: string, systemMessage: string): Promise<string>`
Gets AI response from OpenRouter API.

```typescript
import getResponse from "@/utils/getResponse";

const response = await getResponse(
  [{ role: "user", content: "Hello" }],
  "gpt-4",
  "You are a helpful assistant"
);
```

### `utils/supabase/client.ts`

#### `createClient(): SupabaseClient`
Creates a Supabase client for browser use.

```typescript
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
const { data, error } = await supabase.auth.getUser();
```

## API Routes

### Authentication Routes

All API routes require authentication except where noted. Protected routes return `401 Unauthorized` if user is not authenticated.

### Chat API

#### `POST /api/chat/response`
Gets AI response for a conversation.

**Request Body:**
```typescript
{
  messages: ChatMessage[]
}
```

**Response:**
```typescript
{
  message: string
}
```

**Example:**
```typescript
const response = await fetch("/api/chat/response", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello" }]
  })
});
```

### Conversation API

#### `GET /api/conversation`
Gets all conversations for the authenticated user.

**Response:**
```typescript
{
  conversations: Conversation[]
}
```

#### `POST /api/conversation`
Creates a new conversation.

**Request Body:**
```typescript
{
  title?: string
}
```

**Response:**
```typescript
{
  conversation: Conversation
}
```

#### `DELETE /api/conversation/[id]`
Deletes a conversation by ID.

**Response:**
```typescript
{
  success: boolean
}
```

#### `GET /api/conversation/[id]/messages`
Gets all messages for a conversation.

**Response:**
```typescript
{
  messages: MessageRecord[]
}
```

#### `POST /api/conversation/[id]/messages`
Adds a message to a conversation.

**Request Body:**
```typescript
{
  role: "user" | "assistant" | "system";
  content: string;
  parent_id?: string;
}
```

**Response:**
```typescript
{
  message: MessageRecord
}
```

## Components

### Common Components (`app/components/common/`)

#### `Button`
Reusable button component with multiple variants.

**Props:**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "outlineSecondary";
  onClick?: (e: React.FormEvent) => void;
}
```

**Usage:**
```tsx
<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
```

#### `ButtonLink`
Button styled as a link.

**Props:**
```typescript
interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
}
```

**Usage:**
```tsx
<ButtonLink href="/dashboard" variant="primary">
  Go to Dashboard
</ButtonLink>
```

#### `Modal`
Reusable modal component.

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
  <p>Are you sure?</p>
</Modal>
```

#### `InputArea`
Text input area for chat messages.

**Props:**
```typescript
interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}
```

#### `LoadingSpinner`
Loading spinner component.

**Usage:**
```tsx
<LoadingSpinner />
```

#### `LabelInput`
Labeled input field.

**Props:**
```typescript
interface LabelInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

#### `Sidebar`
Navigation sidebar component.

**Usage:**
```tsx
<Sidebar />
```

#### `Header`
Page header component.

**Usage:**
```tsx
<Header />
```

#### `DashboardHeader`
Dashboard-specific header with user menu.

**Usage:**
```tsx
<DashboardHeader />
```

#### `HeaderMenu`
User menu dropdown.

**Usage:**
```tsx
<HeaderMenu />
```

## Constants

### `consts/common.ts`

#### `SERVICE_NAME`
The application name.

```typescript
export const SERVICE_NAME = "Learning SaaS";
```

#### `DEFAULT_MODEL`
Default AI model for conversations.

```typescript
export const DEFAULT_MODEL = "openrouter/auto";
```

#### `DEFAULT_SYSTEM_MESSAGE`
Default system message for AI conversations.

```typescript
export const DEFAULT_SYSTEM_MESSAGE =
  "You are a helpful assistant. Please respond in plain text without using any formatting.";
```

## Configuration

### Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Middleware (`middleware.ts`)

The application uses middleware for:
- Authentication protection on `/chat` and `/overview` routes
- Session management
- Automatic redirects for unauthenticated users

**Protected Routes:**
- `/chat/*`
- `/overview/*`

**Public Routes:**
- `/`
- `/login`
- `/signup`

### Database Schema

The application expects the following Supabase tables:

#### `conversation`
```sql
CREATE TABLE conversation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  started_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false,
  title text,
  model text DEFAULT 'gpt-4',
  system_prompt text,
  language text DEFAULT 'ja'
);
```

#### `message_record`
```sql
CREATE TABLE message_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversation(id),
  parent_id uuid REFERENCES message_record(id),
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false
);
```

## Error Handling

All API endpoints return consistent error responses:

```typescript
{
  error: string;
  details?: any;
}
```

Common HTTP status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Usage Examples

### Creating a New Chat Session

```typescript
import { useConversationStore } from "@/stores/conversationStore";
import { useChatStore } from "@/stores/chatStore";

const { createNewConversation } = useConversationStore();
const { sendMessage } = useChatStore();

// Create new conversation
const conversationId = await createNewConversation("New Chat");

// Send first message
if (conversationId) {
  await sendMessage("Hello, how can you help me?", conversationId);
}
```

### Switching Between Conversation Branches

```typescript
import { useChatStore } from "@/stores/chatStore";

const { switchToBranch, availableBranches } = useChatStore();

// Get available branches for a message
const branches = availableBranches.get(messageId);

// Switch to a specific branch
if (branches && branches.length > 0) {
  const branchPath = ["msg1", "msg2", branches[0].id];
  switchToBranch(branchPath, conversationId);
}
```

### Creating a Mind Map

```typescript
import { useMindMapStore } from "@/stores/mindMapStore";

const { createMindMapFromMessages } = useMindMapStore();

// Load messages and create mind map
const messages = await fetch(`/api/conversation/${conversationId}/messages`);
const data = await messages.json();
createMindMapFromMessages(data.messages);
```

This documentation covers all public APIs, functions, and components in the Learning SaaS application. Each section includes detailed interfaces, usage examples, and implementation notes to help developers understand and use the codebase effectively.