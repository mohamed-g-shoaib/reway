1. Scale your buttons
The interface should feel as if it’s listening to the user. You should aim to give the user feedback on all of their actions as soon as possible. Submitting a form should show a loading state, copy to clipboard action should show a success state.
One easy way to make your interface feel instantly more responsive is to add a subtle scale down effect when a button is pressed. A scale of 0.97 on the :active pseudo-class should do the job


2. Don’t animate from scale(0)
Elements that animate from scale(0) can make an animation feel off. Try animating from a higher initial scale instead (0.9+). It makes the movement feel more gentle, natural, and elegant. scale(0) feels wrong because it looks like the element comes out of nowhere. A higher initial value resembles the real world more. Just like a balloon, even when deflated it has a visible shape, it never disappears completely.


3. Don’t delay subsequent tooltips
Tooltips should have a delay before appearing to prevent accidental activation. Once a tooltip is open, hovering over other tooltips should open them with no delay and no animation. This feels faster without defeating the purpose of the initial delay. Radix and Base UI, two unstyled component libraries, skip the delay once a tooltip is shown. Base UI allows you to skip the animation as well. To do that you’ll need to target the data-instant attribute and set the transition duration to 0ms.
Here’s how the styles would look like to achieve this:
```css
.tooltip {
  transition:
    transform 0.125s ease-out,
    opacity 0.125s ease-out;
  transform-origin: var(--transform-origin);
 
  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.97);
  }
 
  /** This takes care of disabling subsequent animations */
  &[data-instant] {
    transition-duration: 0ms;
  }
}
```

4. Choose the right easing
Easing, which describes the rate at which something changes over a period of time, is the most important part of any animation. It can make a bad animation look great, and a great animation look bad. If you are animating something that is entering or exiting the screen, use ease-out. It accelerates at the beginning which gives the user a feeling of responsiveness. The dropdown on the left below uses ease-in, which starts slow. The one on the right uses ease-out, which starts fast, making the animation feel faster too [IMAGE]. The duration for these dropdowns is identical, 300ms (you can inspect the code to verify this), but the ease-in one feels slower. That’s the difference easing makes. You could decrease the duration to make ease-in work, but this easing is just not made for UI animations. It speeds up at the end, which is the opposite of what we want. Here’s a visual representation of both curves, blue is ease-out. Notice how much faster it moves at the beginning, that’s what we want for our animations.

Most of the animations you’ve seen so far also use custom easing curves to make them feel better.
The built-in easing curves in CSS are usually not strong enough, which is why I almost never use them. Take a look at the example below where we compare two versions of the ease-in-out curve:
You can still apply the easing principles, just use a custom ease-out for more impact. There are plenty of sites that offer custom variations of all easings, here’s one I recommend: easings.co.


5. Make your animations origin-aware
A way to make your popovers feel better is to make them origin-aware. They should scale in from the trigger. You’ll need CSS’s transform-origin for this, but its default value is center, which is wrong in most cases. Click on the feedback button below to open the popover and see it animate from the center, close it, and press J to set the correct origin and open the popover again.
Pressing S will slow the animation down so you can see the difference better.
You can also click on the dashed buttons to move the component to a different position. The difference is most noticeable when both the horizontal and vertical origins don’t match, like top right.
Base UI and Radix UI support origin-aware animations through CSS variables. This means that applying these variables will set the correct origin automatically.
```css
.radix {
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
}
 
.baseui {
  transform-origin: var(--transform-origin);
}
```
You might think that the difference is subtle, maybe you don’t even notice it. To be honest, whether you or your users notice it doesn’t matter that much. In the aggregate, unseen details become visible, they compound.


6. Keep your animations fast
A faster-spinning spinner makes the app seem to load faster, even though the load time is the same. This improves the perceived performance.
A 180ms select animation feels more responsive than a 400ms one:
As a rule of thumb, UI animations should generally stay under 300ms.
Remove animations or hover interactions altogether if they are seen tens, maybe even hundreds of times a day. Instead of delighting your users, they’ll quickly become annoying and make your interface feel slower.


7. Use blur when nothing else works
If you tried a few different easings and durations for your animation and something about it still feels off, try adding a bit of filter: blur() to mask those imperfections.
Below we have a button that simply crossfades between two states, and another one that adds 2px of blur to that animation. It also uses tip #1 to scale the button down to 0.97 when pressed. Notice how much more pleasing the second button feels.
Blur works here because it bridges the visual gap between the old and new states. Without it, you see two distinct objects, which feels less natural.
It tricks the eye into seeing a smooth transition by blending the two states together.
Notice how much more distinct the two states are without blur:

---

When done right, animations make an interface feel predictable, faster, and more enjoyable to use. They help you and your product stand out.
But they can also do the opposite. They can make an interface feel unpredictable, slow, and annoying. They can even make your users lose trust in your product.
So how do you know when and how to animate to improve the experience?
Step one is making sure your animations have a purpose.

- Purposeful animations
Before you start animating, ask yourself: what’s the purpose of this animation?
As an example, what’s the purpose of this marketing animation we built at Linear?
This animation explains how Product Intelligence (Linear’s feature) works. We could have used a static asset, but the animated version helps the user understand what this feature does, straight in the initial viewport of the page.

Another purposeful animation is this subtle scale down effect when pressing a button. It’s a small thing, but it helps the interface feel more alive and responsive.

Sonner’s enter animation, on the other hand, has two purposes:

- Having a toast suddenly appear would feel off, so we animate it in.
- Because it comes from and leaves in the same direction, it creates spatial consistency, making the swipe-down-to-dismiss gesture feel more intuitive.

But sometimes the purpose of an animation might just be to bring delight.
Morphing of the feedback component below helps make the experience more unique and memorable. This works as long as the user will rarely interact with it. It’ll then become a pleasant surprise, rather than a daily annoyance.

Used multiple times a day, this component would quickly become irritating. The initial delight would fade and the animation would slow users down.
How often users will see an animation is a key factor in deciding whether to animate or not. Let’s dive deeper into it next.

- Frequency of use
I use Raycast hundreds of times a day. If it animated every time I opened it, it would be very annoying. But there’s no animation at all. That’s the optimal experience.
To see it for yourself, try to toggle the open state of the menu below by pressing J and then K. Which one feels better if used hundreds of times a day?

When I open Raycast, I have a clear goal in mind. I don’t expect to be “delighted”, I don’t need to be. I just want to do my work with no unnecessary friction.
Think about what the user wants to achieve and how often they will see an animation. A hover effect is nice, but if used multiple times a day, it would likely benefit the most from having no animation at all.

The same goes for keyboard-initiated actions. These actions may be repeated hundreds of times a day, an animation would make them feel slow, delayed, and disconnected from the user’s actions. You should never animate them.
To see it for yourself, focus on the input below and use arrow keys to navigate through the list. Notice how the highlight feels delayed compared to the keys you press. Now press  (shift) and see how this interaction feels without animation.

But even if your animation won’t be used too often and it fulfills a clear purpose, you still have to think about its speed…

- Perception of speed
Unless you are working on marketing sites, your animations have to be fast. They improve the perceived performance of your app, stay connected to user’s actions, and make the interface feel as if it’s truly listening to the user.

To give you an example, a faster-spinning spinner makes the app seem to load faster, even though the load time is the same. This improves perceived performance.

A 180ms dropdown animation feels more responsive than a 400ms one:
As a rule of thumb, UI animations should generally stay under 300ms.

Another example of the importance of speed: tooltips should have a slight delay before appearing to prevent accidental activation. Once a tooltip is open however, hovering over other tooltips should open them with no delay and no animation.

This feels faster without defeating the purpose of the initial delay.

- Building great interfaces
The goal is not to animate for animation’s sake, it’s to build great user interfaces. The ones that users will happily use, even on a daily basis. Sometimes this requires animations, but sometimes the best animation is no animation.

Knowing when to animate is just one of many things you need to know in order to craft great animations. If you’d like to dive deeper into the theory and practice of it

---

- Good vs Great Animations
We all want our UIs to feel great and animations can definitely help with that. But how do you actually create a great animation? This article is a collection of practical tips to help you go from good to great animations.

- Origin-aware animations
When we click on a button that opens a dropdown, we expect the dropdown to animate from where the button is. This feels natural, it then doesn’t appear out of nowhere, it has a clear origin.
The default transform-origin in CSS is center, but in this case, we want to change it to bottom-center, because that’s where the button is.

If you are using Radix, you can automate it with the --radix-popover-content-transform-origin CSS variable. If you are using shadcn/ui, the work is already done for you.

```css
.radix-dropdown {
  transform-origin: var(--radix-popover-content-transform-origin);
}
```

- Use the right easing
Easing is the most important part of any animation. It can make a bad animation feel great and a great animation feel bad. That’s why you have to know which easing to choose in a specific situation.

Take a look at the example below. Each time you click the play button, the circle moves. The animation uses the ease-in curve. You can switch it to ease-in-out to see the difference. Which one feels better?
You probably guessed that ease-in-out is the better choice here, but why?

Animations have to feel natural. Since we’re moving something that is already on the screen, the motion should mimic natural acceleration and deceleration, just like a car. This curve does exactly that.

While this example covers the ease-in-out curve, you should default to ease-out in most cases. More on that here.

- Use custom easing curves
The built-in easing curves in CSS are usually not strong enough, which is why I almost never use them. Take a look at the example below where we compare two versions of the ease-in-out curve to see the difference.

ease is an exception as it works well for basic hover effects like changing background color, but anything else requires a custom curve for the right feel.

Plenty of sites offer custom easing curves; easing.dev and easings.co are two I recommend if you don’t feel like creating them yourself.

- Spring-based interactions
Changing a component based on mouse position is a nice way to add interactivity to your UI in a subtle way. However, tying visual changes directly to mouse position can feel artificial, as it lacks motion.
To make the interaction feel more natural, use the useSpring hook from Framer Motion (now called Motion). It interpolates value changes with spring-like behavior, rather than updating them immediately.
This makes the interaction feel less artificial, since nothing in the real world changes instantly. There are cases where an instant change on the web is better, but this isn’t one of those cases.

This works, because this animation is decorative, it doesn’t serve any function. If this was a functional graph, in a banking app for example, no animation would be better.

- Know your tools
Knowing which CSS properties to use in a specific situation is key to great animations.

A good tabs transition animates both the highlight bar and the text color, like the one below. But if you change the animation speed (button in the top-right corner), you’ll notice the movement and color change don’t really play well together.
It’s not something you’d notice immediately, but you would be able to tell that something feels off. Usually, playing the animation frame by frame, or in slow motion, helps you spot it.

When you know your tools, you know that using clip-path in this case is what will make the color transition feel right. You can view the implementation of this component here.

Knowing what’s possible doesn’t just help you improve existing animations, it also helps you create new ones. At one point, I played with 3D transforms and came up with this orbiting effect:

App.js
```js
import "./styles.css";

export default function Orbit() {
  return (
    <div className="wrapper">
      <div className="circle" />
      <div className="orbitingCircle" />
    </div>
  );
}
```

styles.css
```css
.wrapper {
  transform-style: preserve-3d;
}

.circle {
  height: 96px;
  width: 96px;
  border-radius: 50%;
  background: #21201C;
}

.orbitingCircle {
  width: 32px;
  height: 32px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #FAD757;
  animation: orbit 6s linear;
  animation-iteration-count: infinite;
}

@keyframes orbit {
  from {
    transform: translate(-50%, -50%) rotateY(0deg) translateZ(72px) rotateY(360deg);
  }
  to {
    transform: translate(-50%, -50%) rotateY(360deg) translateZ(72px) rotateY(0deg);
  }
}
```

While this type of animation is not that impressive, it lets you know that it is possible to animate an element in 3D space in CSS. With a little bit of creativity, you could for example create a 3D loading animation that Yann designed and I coded at Linear.

Or even a 3D coin CSS Animation:

Why does this matter?
Everyone’s software is good enough these days. The barriers to entry are low. To stand out, you need to make your product feel great. One way of doing that is through animations.

Knowing when to add an animation, how, and why, can drastically change how your product is perceived and felt.

---

Great Animations

People increasingly select their tools based on the overall experience rather than just functionality. A predictable and delightful experience is what makes a product stand out from a crowded market. That’s why companies invest in design engineers for example. Animations can play a big role in creating such experiences.

- How do we create such animations?
Great animations are hard, as there are many aspects to consider. From easing and timing to accessibility and performance. This post is a collection of principles that, in my opinion, make animations great.

- Great animations feel natural
People love the dynamic island. It feels natural, almost like a living organism.

This natural motion makes things easier to understand and is a major reason why mobile apps feel better than web apps.

Changes in web apps often occur instantly, which makes the experience feel artificial and unfamiliar, since nothing in world around us disappears or appears instantly.

I highly suggest playing around with spring animations in your projects. Below is a visualizer that can help you understand how spring animations are influenced by different parameters.

- Great animations are fast
Fast animations improve the perceived performance. Take a look at these two spinners for example, which one would load faster?
They would both take the same time to load, but the one on the right gives you an impression as if it’s working very hard to load the data for you.

Snappy animations feel responsive and connected to user’s actions.

The best type of easing for this purpose is ease-out. It starts fast and slows down at the end, which gives the impression of a quick response, while maintaining a smooth transition. Your animations should also usually be shorter than 300ms.

- Great animations have a purpose
It’s easy to start adding animations everywhere. The user then becomes overwhelmed and animations lose their impact. We need to pace them through the experience and add them in places where they enrich the information on the page.

A good example is this animation I made for Vercel. It explains how v0 works. While the animation is arguably entertaining to watch, it’s also insightful.

We can also use animations to indicate a change in state, like with the App Store cards. An enter or exit animation for a modal is also a good example.

Before you add an animation, you should also consider how often the user will see it.

A good tip here is to never animate keyboard initiated actions. These actions are repeated sometimes hundreds of times a day, an animation would make them feel slow and disconnected from user’s actions.

I use Raycast frequently and can’t imagine how frustrating it would be if every time I opened it, I was greeted with a 500ms enter animation.

- Great animations are performant
If our animations won’t run at 60 frames per second, everything else we’ve talked about becomes useless.

The rule of thumb here is that you should try to animate with transform and opacity as they only trigger the third rendering step (composite), while padding or margin triggers all three (layout, paint, composite). The less work the browser has to do, the better the performance.

If the main thread is busy, you should animate using hardware-accelerated animations like CSS or WAAPI (Web Animation API).

A hardware-accelerated animation will remain smooth, no matter how busy the main thread is. Keep in mind that even if you do animate with CSS, not all properties are hardware-accelerated, but if you stick to transform and opacity, you should be fine.

The more logos you add in the demo below, the laggier the Framer Motion animation will become, as it uses requestAnimationFrame under the hood, which is not hardware-accelerated.

This issue happened in Vercel’s dashboard where we animated the active tab. The transition was done with Shared Layout Animations, and because the browser was busy loading the new page, the animation dropped frames. We fixed this by using CSS animations which moved the animation off the CPU.

- Great animations are interruptible
Interruptibility helps your animations feel more natural and responsive. It allows the user to change the state of the animation at any time while maintaining a smooth transition. Try clicking on one of the items below and quickly closing it by pressing the escape key.

The example above is built with Framer Motion, which supports interruptible animations. If you prefer to stick with CSS, you can replace your animations with transitions. A CSS transition can be interrupted and smoothly transition to a new value, even before the first transition has finished. You can see the difference below.

- Great animations are accessible
Animations are used to strategically improve an experience. To some people, animations actually degrade the experience. Animations can make people feel sick or get distracted. That’s not the experience we want to build. To prevent degrading the experience, our animations need to account for people who don’t want animations.

We can use a media query in CSS to adjust the animation based on the user’s preference.
```css
.element {
  animation: bounce 0.2s;
}
 
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fade 0.2s;
  }
}
```

Or use a hook if we are using Framer Motion for example.

```js
import { useReducedMotion, motion } from "framer-motion"
 
export function Sidebar({ isOpen }) {
  const shouldReduceMotion = useReducedMotion();
  const closedX = shouldReduceMotion ? 0 : "-100%";
 
  return (
    <motion.div
      animate={{
        opacity: isOpen ? 1 : 0,
        x: isOpen ? 0 : closedX
      }}
    />
  )
}
```

Great animations feel right
People love using Sonner mainly, because the animation feels satisfying. But I also think it’s because the whole experience of using it is cohesive.
The easing and duration of the animation fits the vibe of the whole library. It’s a bit slower than usual and uses ease as the easing type rather than ease-out to make it feel more elegant. It’s in line with the toast design, page design, its name etc.

Another example of this is Family’s drawer that I recreated on the web. I don’t know the exact animation values that Family used, so it’s not as good, but people still seem to love it.
I think it’s because the easing used in the animation feels right. The opacity change in exiting and entering items works well with the height animation. In this case, it was a matter of trial and error until it felt right. But that’s often the case with animations—you have to be patient.

Take some time to review your animations. I like to review my work the next day because I can see it with fresh eyes and notice imperfections I didn’t see before.
