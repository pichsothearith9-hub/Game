const mybtn = document.getElementById("btn-no");
mybtn = addEventListener("mouseover",()=>{
    let width = Math.random()/5 * innerWidth;
    let height = Math.random()/5 * innerHeight;
    mybtn.style.position = "relative";
    mybtn.style.top = height + "px";
    mybtn.style.left = width + "px";
})