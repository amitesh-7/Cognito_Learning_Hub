# 🎨 Spline 3D Scene Integration Guide

## ✅ Integration Complete!

Your QuizWise-AI landing page now features an interactive 3D scene powered by Spline!

---

## 📦 What Was Installed

### NPM Dependencies
```bash
@splinetool/runtime         # Spline runtime engine
@splinetool/react-spline    # React wrapper for Spline
```

### Components Created

#### 1. **SplineScene.jsx** (`src/components/ui/SplineScene.jsx`)
- Main component for rendering 3D Spline scenes
- Lazy-loaded for optimal performance
- Custom loading spinner

#### 2. **Spotlight.jsx** (`src/components/ui/Spotlight.jsx`)
- Animated spotlight effect (Aceternity style)
- SVG-based with gradient animations
- Used for dramatic lighting effects

#### 3. **SpotlightInteractive.jsx** (`src/components/ui/SpotlightInteractive.jsx`)
- Mouse-tracking spotlight effect (ibelick style)
- Framer Motion powered
- Follows cursor movement

#### 4. **SplineSceneDemo.jsx** (`src/components/SplineSceneDemo.jsx`)
- Complete demo component combining:
  - 3D Spline scene
  - Spotlight effect
  - Animated text content
  - Responsive layout

---

## 🎯 Where It's Used

**Location**: `HomePage.jsx`
- **Position**: Between Hero Section and Features Section
- **Line**: ~405 (after Hero, before Features)

---

## 🔧 Configuration Changes

### 1. **vite.config.js** - Added Path Alias
```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```
This enables clean imports like `import { cn } from '@/lib/utils'`

### 2. **tailwind.config.cjs** - Added Spotlight Animation
```javascript
animation: {
  spotlight: "spotlight 2s ease .75s 1 forwards",
},
keyframes: {
  spotlight: {
    "0%": { opacity: 0, transform: "translate(-72%, -62%) scale(0.5)" },
    "100%": { opacity: 1, transform: "translate(-50%,-40%) scale(1)" },
  },
},
```

---

## 🎨 Component Props & Customization

### SplineScene
```jsx
<SplineScene 
  scene="YOUR_SPLINE_URL"     // Required: Spline scene URL
  className="w-full h-full"   // Optional: CSS classes
/>
```

### Spotlight (Static)
```jsx
<Spotlight
  className="-top-40 left-0"  // Optional: Position
  fill="white"                // Optional: Color (default: white)
/>
```

### SpotlightInteractive (Mouse-tracking)
```jsx
<SpotlightInteractive
  size={200}                  // Optional: Size in pixels
  springOptions={{ bounce: 0 }} // Optional: Spring physics
  className="custom-class"    // Optional: CSS classes
/>
```

---

## 🎬 How to Use Different Spline Scenes

### Step 1: Create Scene in Spline
1. Go to [spline.design](https://spline.design)
2. Create or edit your 3D scene
3. Click "Export" → "Code Export" → "React"
4. Copy the scene URL (looks like: `https://prod.spline.design/XXX/scene.splinecode`)

### Step 2: Update Component
```jsx
<SplineSceneDemo />
```

Then edit `src/components/SplineSceneDemo.jsx`:
```jsx
<SplineScene 
  scene="YOUR_NEW_SPLINE_URL_HERE"
  className="w-full h-full"
/>
```

---

## 📱 Responsive Design

The component is **fully responsive**:

- **Desktop**: Side-by-side layout (text | 3D scene)
- **Mobile**: Stacked layout (text above, 3D scene below)
- **Minimum Heights**: 
  - Mobile: 300px
  - Desktop: 500px

---

## ⚡ Performance Optimizations

### Lazy Loading
```jsx
const Spline = lazy(() => import('@splinetool/react-spline'));
```
- Component loads **only when needed**
- Reduces initial bundle size
- Shows loading spinner while loading

### Suspense Fallback
```jsx
<Suspense fallback={<div className="...">Loading spinner</div>}>
  <Spline ... />
</Suspense>
```

---

## 🎨 Customization Examples

### Change Background Color
```jsx
<Card className="... bg-gradient-to-br from-indigo-900 to-purple-900">
```

### Change Text Content
Edit `SplineSceneDemo.jsx`:
```jsx
<h1>Your Custom Title</h1>
<p>Your custom description</p>
```

### Add More Interactive Elements
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600"
>
  Interact with 3D
</motion.button>
```

### Use Different Spotlight
Replace `Spotlight` with `SpotlightInteractive` for mouse-tracking:
```jsx
import { SpotlightInteractive } from "./ui/SpotlightInteractive";

<SpotlightInteractive size={300} className="..." />
```

---

## 🐛 Troubleshooting

### Issue: 3D Scene Not Loading
**Solution**: 
1. Check Spline URL is correct
2. Verify internet connection (Spline loads from CDN)
3. Open browser console for errors

### Issue: "Module not found: @/lib/utils"
**Solution**: 
- Restart Vite dev server after `vite.config.js` changes
- Run: `npm run dev`

### Issue: Slow Loading
**Solution**:
- Spline scenes can be large (2-5MB)
- Consider using simpler 3D models
- Add loading progress indicator

### Issue: Mobile Performance
**Solution**:
```jsx
// Disable 3D on mobile
{!isMobile && <SplineScene ... />}

// Or use lower quality
<SplineScene 
  scene={isMobile ? SIMPLE_SCENE_URL : COMPLEX_SCENE_URL}
/>
```

---

## 🎯 Next Steps

### 1. **Replace Default Scene**
- Create your own Spline 3D scene
- Export and get the scene URL
- Update `SplineSceneDemo.jsx`

### 2. **Add More Interactions**
```jsx
<SplineScene 
  scene="..."
  onLoad={() => console.log('Scene loaded!')}
  onMouseDown={(e) => console.log('User clicked 3D object')}
/>
```

### 3. **Create Multiple Variations**
```jsx
// Feature showcase
<SplineSceneDemo scene={FEATURE_SCENE} title="AI Quiz Generation" />

// Testimonials
<SplineSceneDemo scene={TESTIMONIAL_SCENE} title="User Stories" />
```

### 4. **Add Section Navigation**
```jsx
<Button onClick={() => scrollTo('#3d-section')}>
  Explore 3D Experience
</Button>
```

---

## 📚 Resources

- **Spline Documentation**: [docs.spline.design](https://docs.spline.design)
- **Spline React Guide**: [docs.spline.design/react](https://docs.spline.design/react)
- **Community Examples**: [spline.community](https://spline.community)
- **Free 3D Assets**: [spline.design/library](https://spline.design/library)

---

## 🎨 Design Tips

### Color Schemes
```jsx
// Dark Mode (current)
bg-black/[0.96]

// Light Mode Alternative
bg-gradient-to-br from-slate-50 to-indigo-100

// Glassmorphism
bg-white/10 backdrop-blur-xl border border-white/20
```

### Text Gradients
```jsx
<h1 className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
  Gradient Text
</h1>
```

### Animation Variants
```jsx
<motion.div
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>
  Content
</motion.div>
```

---

## ✅ Testing Checklist

- [ ] 3D scene loads on desktop
- [ ] 3D scene loads on mobile
- [ ] Loading spinner shows while loading
- [ ] Spotlight animation plays
- [ ] Text is readable on dark background
- [ ] Responsive layout works (mobile/tablet/desktop)
- [ ] No console errors
- [ ] Performance is acceptable (use Lighthouse)

---

## 🚀 Performance Metrics

Expected metrics after integration:
- **Bundle Size**: +150KB (Spline runtime)
- **Initial Load**: 2-3 seconds (3D scene download)
- **Lighthouse Score**: 85-90 (depending on scene complexity)

---

## 💡 Pro Tips

1. **Optimize Spline Scenes**:
   - Keep polygon count under 100K
   - Use compressed textures
   - Limit animated elements

2. **Lazy Load on Scroll**:
   ```jsx
   <LazyLoad height={500} offset={100}>
     <SplineSceneDemo />
   </LazyLoad>
   ```

3. **Fallback for Old Browsers**:
   ```jsx
   {isWebGLSupported ? (
     <SplineSceneDemo />
   ) : (
     <img src="/fallback-image.png" alt="3D Preview" />
   )}
   ```

4. **Cache Optimization**:
   - Spline scenes are cached by browser
   - Repeat visitors load instantly

---

## 🎉 You're All Set!

Your landing page now has:
- ✅ Interactive 3D scene
- ✅ Smooth animations
- ✅ Dramatic lighting effects
- ✅ Responsive design
- ✅ Optimized performance

**Run the dev server**: `npm run dev`  
**View your creation**: `http://localhost:5173`

Enjoy your new 3D experience! 🚀
