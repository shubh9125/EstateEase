# 🖼️ Image Upload Debugging Guide

## What Was Fixed

### Backend Issues (Fixed):
1. **CORS Headers** - Added proper headers for cross-origin image serving
2. **Static File Serving** - Enhanced `/uploads` route with proper middleware
3. **Directory Management** - Ensured `backend/uploads/properties` exists before upload
4. **Error Logging** - Added detailed console logs for debugging

### Frontend Issues (Fixed):
1. **Image URL Construction** - Added debugging to `getPropertyImageUrl()`
2. **Upload Logging** - Added detailed logging to upload process
3. **Error Handling** - Better error messages for upload failures

---

## How to Test & Debug

### Step 1: Start the Backend
```bash
cd backend
npm start
```
✅ You should see in console:
```
Upload directory ready at: /absolute/path/to/backend/uploads/properties
Server started on port 5000
```

### Step 2: Verify Backend is Ready
Open in browser: `http://localhost:5000/check-uploads`

You should see:
```json
{
  "status": "Uploads directory found",
  "path": "/absolute/path/to/backend/uploads",
  "propertiesPath": "/absolute/path/to/backend/uploads/properties",
  "fileCount": 0,
  "files": []
}
```

### Step 3: Start Frontend & Login
- Open `frontend/index.html`
- Login as a Seller
- Navigate to Seller Dashboard

### Step 4: Create a Property with Images
1. Fill in all property details
2. Click "Choose File" and select 1-2 test images
3. Click "Submit For Verification"

### Step 5: Check Console Logs
Open DevTools: Press `F12` → Go to Console tab

#### Expected Backend Logs:
```
[IMAGE UPLOAD] Property: 5f8d7e8c8e8e8e8e8e8e8e8e, Files uploaded: 2
[IMAGE UPLOAD] File saved: 1634567890-123456789.jpg -> /uploads/properties/1634567890-123456789.jpg
[IMAGE UPLOAD] File saved: 1634567891-987654321.png -> /uploads/properties/1634567891-987654321.png
[IMAGE UPLOAD] Total images now: 2
[IMAGE UPLOAD] Property saved successfully with 2 images
```

#### Expected Frontend Logs:
```
[Property Creation] Uploading 2 images...
[Property Creation] Image 1: photo1.jpg
[Property Creation] Image 2: photo2.png
[Upload] Starting image upload for property: 5f8d7e8c8e8e8e8e8e8e8e8e
[Upload] Response status: 200
[Upload] Success! Property now has 2 images
[Property Creation] All images uploaded successfully
```

---

## Troubleshooting

### Issue: "No image" placeholder shows
1. **Check Frontend Console**
   - Should see `[Image URL]` logs
   - Example: `[Image URL] Original: /uploads/properties/123456.jpg -> Final: http://localhost:5000/uploads/properties/123456.jpg`
   - If URL looks wrong, images folder path might be incorrect

2. **Check Backend is Serving Images**
   - Try directly: `http://localhost:5000/uploads/properties/[filename]`
   - Should download the image (not show 404)

3. **Verify Files Exist**
   - Check folder: `backend/uploads/properties/`
   - Should contain `.jpg`, `.png`, or `.webp` files
   - If empty, files didn't upload

### Issue: Upload fails with error message
1. **Check Network Tab**
   - DevTools → Network → Click the upload request
   - Look at Response tab for error details
   - If status is 413, file is too large (max 5MB)

2. **Check Backend Console**
   - Should see `[IMAGE UPLOAD]` logs
   - If no logs, request didn't reach backend
   - Check Authorization header and token validity

### Issue: Image paths in database are wrong
1. **Verify in MongoDB**
   ```javascript
   db.properties.findOne({ _id: ObjectId("...") })
   ```
   - Should show `images: [ "/uploads/properties/filename.jpg", ... ]`
   - If images array is empty, not being saved to DB

2. **Check Property Model**
   - Images should be array of strings
   - Each path should start with `/uploads/properties/`

### Issue: Static files returning 404
1. **Check Server Configuration**
   - Verify `backend/src/server.js` has:
     ```javascript
     const uploadsDir = path.resolve(__dirname, '../uploads');
     app.use('/uploads', express.static(uploadsDir, { setHeaders: ... }));
     ```

2. **Check Folder Permissions**
   ```bash
   # Windows - Check folder exists
   dir backend\uploads\properties
   
   # Linux/Mac - Check folder exists and permissions
   ls -la backend/uploads/properties
   ```

---

## Quick Checklist

- [ ] Backend server running (port 5000)
- [ ] `http://localhost:5000/check-uploads` returns status OK
- [ ] `backend/uploads/properties/` folder exists
- [ ] Images have correct extensions (.jpg, .jpeg, .png, .webp)
- [ ] Console shows `[IMAGE UPLOAD]` logs on backend
- [ ] Console shows `[Upload]` logs on frontend
- [ ] Image files actually exist in `backend/uploads/properties/`
- [ ] Database shows images array with paths in property document
- [ ] Direct URL like `http://localhost:5000/uploads/properties/filename.jpg` works

---

## Still Having Issues?

### Enable More Detailed Logging
Add this to `backend/src/server.js` before routes:
```javascript
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});
```

### Check Full Error Stack
Look for full error messages in:
- Browser Console → Application tab → Storage → Local Storage (token)
- Backend terminal output (look for [ERROR] or [IMAGE UPLOAD ERROR])
- Network tab → Response body (full error details)

### Test Upload Directly
```bash
# Test with curl
curl -X POST http://localhost:5000/api/properties/[PROPERTY_ID]/upload \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -F "images=@path/to/image.jpg"
```

---

## Performance Tip
If uploading many images, consider:
1. Compress images before uploading
2. Upload fewer files at once (max 10)
3. Increase timeout if files are large

Good luck! 🚀
