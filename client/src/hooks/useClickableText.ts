import { useEffect } from 'react'

/**
 * Hook to automatically mark clickable text elements for eye-tracking
 * This enhances detection of interactive text elements
 */
export function useClickableText(containerRef?: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const container = containerRef?.current || document.body
    
    // Find all elements with click handlers or interactive styles
    const markClickableElements = () => {
      // Get all elements that might be clickable
      const allElements = container.querySelectorAll('*')
      
      allElements.forEach(el => {
        if (!(el instanceof HTMLElement)) return
        
        // Skip if already marked
        if (el.getAttribute('data-eye-clickable') === 'true') return
        
        // Skip if disabled
        if (el.hasAttribute('disabled')) return
        
        // Check if element has click handler
        const hasClickHandler = el.onclick !== null || 
                               el.getAttribute('onclick') !== null
        
        // Check if element has pointer cursor
        const computedStyle = window.getComputedStyle(el)
        const hasPointerCursor = computedStyle.cursor === 'pointer'
        
        // Check if it's an interactive element (including all buttons)
        const isInteractive = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)
        
        // Check if it's a clickable text element with specific classes
        const hasClickableClass = el.classList.contains('btn') || 
                                 el.classList.contains('button') ||
                                 el.classList.contains('important-button')
        
        // Check for role attributes
        const hasInteractiveRole = ['button', 'link', 'menuitem', 'tab'].includes(
          el.getAttribute('role') || ''
        )
        
        // Check if parent is a link or button
        const hasClickableParent = el.closest('button, a, [role="button"]') !== null
        
        // Mark as clickable if any condition is met
        if (hasClickHandler || hasPointerCursor || isInteractive || hasInteractiveRole || hasClickableClass || hasClickableParent) {
          el.setAttribute('data-eye-clickable', 'true')
        }
      })
    }
    
    // Initial marking
    markClickableElements()
    
    // Re-mark on DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      markClickableElements()
    })
    
    observer.observe(container, {
      childList: true,
      subtree: true
    })
    
    return () => {
      observer.disconnect()
    }
  }, [containerRef])
}

export default useClickableText
