# Developer Workbench Plugin - Integration Guide

## ✅ Build Status

The plugin is rebuilt as a **purely additive** contribution to the DSH input zone:

- ✅ TypeScript compilation successful
- ✅ Browser bundle generated: `lib/client.js`
- ✅ Scoped CSS artifact included
- ✅ Type declarations generated
- ✅ Test suite: registration contract / presentation / DOM interaction

## 🔄 Design

### Original Design (Not Compatible)
The original plugin tried to replace the host `root` frame and registered into seats it could not add to:

- ❌ `root` — redeclared `sidebar` / `conversation` / `details`, which fails at load time (`slot "sidebar" is already declared`)
- ❌ `details` — a single slot already occupied by the host DetailsPanel (registration would shadow it)
- ❌ `tool.call.toolview` (keyed) — the keyed entry never matched a tool name and would replace the generic card

### Updated Design (Purely Additive)
The plugin now registers into two **list slots** whose occupants coexist by `id`/`order`:

1. **Task Launcher**
   - Slot: `conversation.input.dock` (`id: 'workbench', order: 10`)
   - Component: `TaskLauncherDock`
   - Shows starter prompts in blank, idle sessions above the composer; fills the draft via `inputActions.setDraft`

2. **Active Task Indicator**
   - Slot: `conversation.input.right` (`id: 'workbench', order: 0`)
   - Component: `ActiveTaskIndicator`
   - Displays running/queued status and a progress track from the injected `useSession` hook

The plugin never declares host-owned seats (`root`, `details`, `tool.call.toolview`), so it loads without error and never replaces a shipped occupant.

## 📋 Installation Steps

1. **Pack the plugin:**
   ```bash
   cd E:\IDEWorkplaces\DeepSeekHarness\dsh-developer-workbench
   pnpm pack
   ```
   This creates: `deepseek-ai-dsh-developer-workbench-0.1.0-rc.0.tgz`

2. **Install in a DSH profile project:**
   ```bash
   cd <your-profile-project>
   pnpm add E:\IDEWorkplaces\DeepSeekHarness\dsh-developer-workbench\deepseek-ai-dsh-developer-workbench-0.1.0-rc.0.tgz
   ```

3. **Add to cordis.patch.yml:**
   ```yaml
   plugins:
     - id: dsh-web-app
       name: '@deepseek-ai/dsh-client-web'
     # Add this row AFTER dsh-web-app
     - id: developer-workbench
       name: '@deepseek-ai/dsh-developer-workbench'
   ```

4. **Run the web app:**
   ```bash
   dsh web
   ```

## 🎨 UI Features

### Task Launcher Dock
- Shows only on blank, idle sessions (no durable turn yet, not running)
- Three starter buttons with Chinese prompts:
  - 修复失败测试 (Fix failing tests)
  - 重构模块 (Refactor a module)
  - 解释代码库 (Explain the codebase)
- Clicking calls the host's `inputActions.setDraft` to fill the composer draft

### Active Task Indicator
- Shows session status in the input right area from `useSession` selectors
- Visual indicators:
  - Green dot + "Running" when the session is active
  - Yellow dot + queue count when tasks are pending
  - Progress bar showing a completion proportion

## 🔍 Verification

After installation, verify the plugin is working:

1. **Check contribution markers:**
   ```javascript
   document.querySelector('[data-dsh-workbench-task-launcher]')
   document.querySelector('[data-dsh-workbench-active-task]')
   ```

2. **Confirm the host frame is unchanged:**
   ```javascript
   // The host frame must NOT be replaced; its own markers stay.
   document.querySelector('[data-dsh-developer-workbench="true"]') // null
   ```

3. **Test disable/uninstall:**
   - Remove the plugin row from `cordis.patch.yml`
   - Reload the page
   - The dock markers disappear; session data, drafts, and tool history are untouched

## 🐛 Troubleshooting

### Plugin not loading
- Check browser console for errors
- Verify `lib/client.js` exists in the installed package
- Ensure the plugin is listed AFTER `dsh-web-app` in the patch file
- A `slot "…" is already declared` error means a contribution registered into a single-slot seat — the additive design avoids this entirely

### Styles not applying
- Check if `workbench.css` is loaded in the page
- Verify a component root carries `data-dsh-developer-workbench="true"` (the scoping marker)
- Clear browser cache and reload

### Contributions not rendering
- Check that all required peer dependencies are installed at compatible versions
- Verify the slot names match exactly (case-sensitive): `conversation.input.dock`, `conversation.input.right`
- Check browser console for slot registration errors

## 📚 Architecture Notes

### Why These Slots?
The plugin is additive by construction:
- `conversation.input.dock` / `conversation.input.right` are **list slots** — occupants coexist by `id`/`order` beside the shipped entries (todo, queue, …)
- The host injects session-standard hooks (`useSession`, `inputActions`, `t`); the components never receive a `session` object
- Tokens and styles are scoped under the `data-dsh-developer-workbench="true"` marker on each component root

### Compatibility
This plugin works with DSH client packages at version `^0.1.1-rc.2` or later, as long as they maintain the same public slot contracts.

### Future Enhancements
Potential additions that stay within the additive contract:
- More starter tasks in the launcher
- Additional list-slot occupants in the input zone
- Plan-visualization contributions through list slots that expose them

## 📄 License

MIT - See LICENSE file for details
