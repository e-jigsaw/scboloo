import config from '../config'

const selectElm = document.querySelector('#projectSelect')
const imageListDiv = document.querySelector('#imageList')

const zpad = n => n.toString().length === 1 ? `0${n}` : n.toString()

document.querySelector('#createButton').addEventListener('click', (e) => {
  e.preventDefault()
  const now = new Date()
  chrome.runtime.sendMessage(chrome.runtime.id, {
    target: 'main',
    action: 'createScrapboxPage',
    projectName: selectElm.value,
    imageUrl: !document.querySelector('#dontUseImageCheckBox').checked && document.querySelector('.selected').src,
    text: `${document.querySelector('#scrapboxText').value}\n\n\n#${now.getFullYear()}${zpad(now.getMonth() + 1)}${zpad(now.getDate())} #${zpad(now.getMonth() + 1)}${zpad(now.getDate())}\n`,
    title: document.querySelector('#pageTitle').value
  })
  window.close()
})

document.querySelector('#dontUseImageCheckBox').addEventListener('change', (e) => {
  if (e.target.checked) {
    imageListDiv.classList.add('disabled')
  } else {
    imageListDiv.classList.remove('disabled')
  }
})

chrome.runtime.sendMessage(chrome.runtime.id, {
  target: 'main',
  action: 'getQuotedText'
}, (text) => {
  document.querySelector('#scrapboxText').value = text
})

chrome.runtime.sendMessage(chrome.runtime.id, {
  target: 'main',
  action: 'getPageTitle'
}, (title) => {
  document.querySelector('#pageTitle').value = title
})

chrome.runtime.sendMessage(chrome.runtime.id, {
  target: 'main',
  action: 'getImages'
}, (images) => {
  (images || []).forEach((imageUrl, index) => {
    const imageElm = document.createElement('img')
    imageElm.src = imageUrl
    if (index === 0) imageElm.classList.add('selected')
    imageListDiv.appendChild(imageElm)
    imageElm.addEventListener('click', (e) => {
      const imageElm = e.target
      if (imageElm.classList.contains('selected')) return
      const selected = document.querySelector('.selected')
      selected.classList.remove('selected')
      imageElm.classList.add('selected')
    })
  })
})

chrome.runtime.sendMessage(chrome.runtime.id, {
  target: 'main',
  action: 'fetchApi',
  apiType: 'getProjects'
}, async (res) => {
  const {projects} = res
  const mine = ['583256a009a8060011429d66', '5c29451d434bf90017d3b218']
  projects
    .filter(project => mine.some(id => id === project.id))
    .concat(
      projects
        .filter(project => !mine.some(id => id === project.id))
    ).forEach((project) => {
      const optionElm = document.createElement('option')
      optionElm.value = project.name
      optionElm.textContent = `${project.name} - ${project.displayName}`
      selectElm.appendChild(optionElm)
    })
  selectElm.value = (await config.projectName()) || projects[0].name
})
