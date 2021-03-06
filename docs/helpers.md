<a name="helpers"></a>

## helpers
Helpers Module.

**Kind**: global variable  
**Access:** public  

* [helpers](#helpers)
    * [.serialize(params)](#helpers.serialize) ⇒ <code>string</code>
    * [.shallowMerge(destination, source)](#helpers.shallowMerge) ⇒ <code>object</code>
    * [.openWindow(url, name, options)](#helpers.openWindow) ⇒ <code>object</code>

<a name="helpers.serialize"></a>

### helpers.serialize(params) ⇒ <code>string</code>
Serializes an object into a formatted string.

**Kind**: static method of <code>[helpers](#helpers)</code>  
**Access:** public  

| Param | Type |
| --- | --- |
| params | <code>object</code> | 

<a name="helpers.shallowMerge"></a>

### helpers.shallowMerge(destination, source) ⇒ <code>object</code>
Merges a shallow `source` object into the `destination` object.

**Kind**: static method of <code>[helpers](#helpers)</code>  
**Access:** public  

| Param | Type |
| --- | --- |
| destination | <code>object</code> | 
| source | <code>object</code> | 

<a name="helpers.openWindow"></a>

### helpers.openWindow(url, name, options) ⇒ <code>object</code>
Loads a resource into a new browsing context (`window`).

**Kind**: static method of <code>[helpers](#helpers)</code>  
**Access:** public  
**See**: [Window.open()](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) for more options.  

| Param | Type |
| --- | --- |
| url | <code>string</code> | 
| name | <code>string</code> | 
| options | <code>object</code> | 
| options.width | <code>number</code> | 
| options.height | <code>number</code> | 

