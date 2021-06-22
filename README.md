# Thinkific Theme Inspector for Chrome

Profile and debug Liquid template on your Thinkific store.

Thinkific themes are fast out of the box, but Liquid changes made afterwards can cause slowdowns. Thinkific Theme Inspector for Chrome helps identify Liquid changes that are slowing your site down by providing a visualization of Liquid render profiling data, and giving you the means to triage the slowest parts of your Thinkific theme.


![Elements](https://user-images.githubusercontent.com/4837696/70237825-018e5780-1736-11ea-9fda-3691e73abf28.png)

## Install
[Visit the Chrome Web Store page](https://chrome.google.com/webstore/detail/Thinkific-theme-inspector-f/fndnankcflemoafdeboboehphmiijkgp) and select **Add to Chrome**.

## How to use

1. Navigate to your Thinkific site.
2. [Open Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/open).
3. Navigate to the Thinkific tab, located in the top group of tabs in Chrome DevTools.
4. Click the **↻** (Load Profile) button to request and view your Liquid profile [flamegraph](http://www.brendangregg.com/FlameGraphs/cpuflamegraphs.html#Description).

**Note:** You must be a Site owner or Site admin and be logged into your thinkific site to access profiling.

## Share your Performance Wins!
-- coming soon

## Understanding the Liquid profile flame graph

Starting from the top of the stack, `Page` contains the total time the server spent to render the entire page.

<p align="center">
  <img width="700" src="https://user-images.githubusercontent.com/2319002/73567139-9782ed80-441a-11ea-8379-9393e2a1ff13.png" />
</p>

The total time `Page` spent on rendering does not equal to time to first byte (TTFB). There will be some overhead due to the network.

<p align="center"><b>Page total render time + network overhead = time to first byte</b></p>

`template:index` is an example of top level liquid code that `Page` needs to resolve and render. You can learn more details about this section by clicking on the bar.

<p align="center">
  <img width="400" src="https://user-images.githubusercontent.com/2319002/73567318-06f8dd00-441b-11ea-9ea5-13249baa989f.png" />
</p>

* File - where this code is located in your themes files
* Total Time - the time it took for server to render this code
* Code snippet - the exact code that server resolved (The link will take you to Online Store Code Editor)
* Line - the line number where the code exists

## What to look for when debugging?
### Too many sections

<p align="center">
  <img width="700" src="https://user-images.githubusercontent.com/2319002/73567445-49221e80-441b-11ea-9297-186d2f275d48.png" />
</p>

For each section, the server will take time to resolve and render. When there are too many sections, the server will take more time to resolve.

### Too deep

<p align="center">
  <img width="700" src="https://user-images.githubusercontent.com/2319002/73568079-863ae080-441c-11ea-97c6-db3b3d206a5e.png" />
</p>

Here are some possible reasons why a flame graph would result in this situation:

* Too many conditionals
* Nested loops
* Nested includes
* Combination of all of the above

### Non-Visual Sections

These sections could be for:
* Scripts
* SEO
* Analytics
* … etc.

Evaluate whether these sections are necessary or refactor it so that it becomes more efficient.

## FAQ

### I received an error page which says "This page cannot be profiled."

If you see this error, it may be because of one of the following conditions:
  * You must be logged in to the site as either a Thinkific System User, Site Owner or Site Admin.
  * Your account does not have access to the current store you are trying to profile.
  * There was an unhandled error in the request, e.g. timeout, lost connection, etc.

If it was none of the errors above you can right click on Thinkific DevTools, inspect page, and view console for error details.

## Contributing
To learn more about how to contribute to this project check out the [contributing](https://github.com/Thinkific/Thinkific-theme-inspector/blob/master/CONTRIBUTING.md) documentation.

If you find a bug please [open an issue](https://github.com/Thinkific/Thinkific-theme-inspector/issues/new).

If you would like to request a feature, check out the [feature request documentation](https://github.com/Thinkific/Thinkific-theme-inspector/blob/master/FEATURE_REQUEST.md).
