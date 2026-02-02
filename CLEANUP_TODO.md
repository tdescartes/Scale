# Repository Cleanup TODO

This document outlines all the steps needed to complete the migration from Python+Next.js dual-stack to a pure Next.js architecture.

## Current Status

- ✅ Next.js API routes created and working
- ✅ MetricsService ported to TypeScript
- ✅ Frontend updated to use local APIs with polling
- ✅ New Dockerfile created in root
- ⏳ Legacy files still need to be removed

---

## Step 1: Delete Python Backend Files

### Files to Delete:

- [ ] `backend/` - Entire Python backend folder
- [ ] `.venv/` - Python virtual environment
- [ ] `requirements.txt` - Python dependencies
- [ ] `setup.sh` - Python setup script

### Command:

```powershell
Remove-Item -Recurse -Force backend, .venv, requirements.txt, setup.sh
```

---

## Step 2: Delete Old Docker Files

### Files to Delete:

- [ ] `Dockerfile.backend` - Old Python Dockerfile
- [ ] `Dockerfile.frontend` - Old frontend Dockerfile (replaced by `Dockerfile`)

### Command:

```powershell
Remove-Item -Force Dockerfile.backend, Dockerfile.frontend
```

---

## Step 3: Delete Old Summary/Documentation Files

### Files to Delete:

- [ ] `BACKEND_REFACTORING_SUMMARY.md`
- [ ] `COMPLETE_REFACTORING_SUMMARY.md`
- [ ] `COMPLETION_REPORT.md`
- [ ] `DOCUMENTATION.md`
- [ ] `FEATURE_SUMMARY.md`
- [ ] `IMPLEMENTATION_SUMMARY.md`
- [ ] `SECURITY_UPDATES.md`
- [ ] `demo.html`

### Command:

```powershell
Remove-Item -Force BACKEND_REFACTORING_SUMMARY.md, COMPLETE_REFACTORING_SUMMARY.md, COMPLETION_REPORT.md, DOCUMENTATION.md, FEATURE_SUMMARY.md, IMPLEMENTATION_SUMMARY.md, SECURITY_UPDATES.md, demo.html
```

---

## Step 4: Delete Root-Level Node Modules (Duplicate)

### Files to Delete:

- [ ] `node_modules/` - Root level (frontend has its own)
- [ ] `package.json` - Root level (frontend has its own)
- [ ] `package-lock.json` - Root level

### Command:

```powershell
Remove-Item -Recurse -Force node_modules, package.json, package-lock.json
```

---

## Step 5: Update Kubernetes Configuration

### Actions:

- [ ] Delete `k8s/backend-deployment.yaml` - No longer needed
- [ ] Rename `k8s/frontend-deployment.yaml` to `k8s/deployment.yaml`
- [ ] Update deployment to use new naming (`scale-app` instead of `scale-frontend`)
- [ ] Update `k8s/ingress.yaml` to point to single service

### Commands:

```powershell
Remove-Item -Force k8s/backend-deployment.yaml
Rename-Item k8s/frontend-deployment.yaml deployment.yaml
```

---

## Step 6: Update README.md

### Actions:

- [ ] Update project description to reflect Next.js-only architecture
- [ ] Remove Python/FastAPI references
- [ ] Update installation instructions
- [ ] Update Docker instructions
- [ ] Update deployment instructions

---

## Step 7: Update DEPLOYMENT.md

### Actions:

- [ ] Simplify deployment instructions for single service
- [ ] Remove Python backend deployment steps
- [ ] Update Kubernetes instructions

---

## Step 8: Update .gitignore

### Actions:

- [ ] Remove Python-specific entries (or keep for safety)
- [ ] Ensure Node.js entries are present
- [ ] Add any missing entries

---

## Step 9: Update docker-compose.yml

### Actions:

- [ ] Verify single service configuration
- [ ] Remove any backend service references
- [ ] Ensure correct Dockerfile path

---

## Step 10: Verify and Test

### Actions:

- [ ] Run `npm run dev` in frontend folder
- [ ] Verify all API endpoints work
- [ ] Test autoscaling toggle
- [ ] Test algorithm change
- [ ] Test failure injection
- [ ] Build Docker image and test

---

## Final Checklist

After all steps are complete:

- [ ] All Python files removed
- [ ] Single Dockerfile in root
- [ ] Single docker-compose.yml service
- [ ] Updated Kubernetes configs
- [ ] Updated documentation
- [ ] Application runs successfully
- [ ] Delete this CLEANUP_TODO.md file

---

## Notes

- The app is currently running on http://localhost:3001
- All API endpoints are returning 200 OK
- Autoscaling is working (logs show "Scaling UP/DOWN" messages)
