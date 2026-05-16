const host = window.location.origin + "/api";
let audio = document.getElementById("audio");
let nowId = "";
let nowUrl = "";
let nowName = "";
let nowAuth = "";
let quality = 128;
let playList = [];
let playIndex = 0;

$(".nav-item").click(function(){
    $(".nav-item").removeClass("active");
    $(this).addClass("active");
    let t = $(this).data("type");
    if(t=="recommend")getRec();
    if(t=="rank")getRank();
    if(t=="playlist")getHotPlay();
})

function getRec(){
    $("#songListBox").html("<div class='loading'>加载推荐...</div>");
    $.get(`${host}/top/song?type=netease`,res=>{
        let html="";
        res.forEach(v=>{
            html+=`<div class="music-item" data-id="${v.id}">${v.name} - ${v.artist}</div>`
        })
        $("#songListBox").html(html);bindSong();
    })
}
function getRank(){
    $("#songListBox").html("<div class='loading'>加载榜单...</div>");
    $.get(`${host}/ranklist`,res=>{
        let html="";
        res.forEach(v=>{
            html+=`<div class="music-item" data-id="${v.id}">${v.name}</div>`
        })
        $("#songListBox").html(html);bindSong();
    })
}
function getHotPlay(){
    $("#songListBox").html("<div class='loading'>加载歌单...</div>");
    $.get(`${host}/playlist/hot`,res=>{
        let html="";
        res.forEach(v=>{
            html+=`<div class="music-item" data-id="${v.id}">${v.name}</div>`
        })
        $("#songListBox").html(html);bindSong();
    })
}

function bindSong(){
    $(".music-item").click(function(){
        let id = $(this).data("id");
        playSong(id);
    })
}

function playSong(id){
    nowId=id;
    $.get(`${host}/url?id=${id}&quality=${quality}`,res=>{
        if(!res.url){alert("暂无该音质音源");return;}
        nowUrl=res.url;
        $.get(`${host}/song?id=${id}`,d=>{
            nowName=d.name;nowAuth=d.artist;
            $("#playName").text(d.name);
            $("#playAuthor").text(d.artist);
            $("#playCover").attr("src",d.pic);
            audio.src=nowUrl;audio.play();
            addList(d,id);
            getLyric(id);
        })
    })
}

function addList(info,id){
    let has = playList.find(x=>x.id==id);
    if(!has)playList.push({id:id,name:info.name,auth:info.artist});
    renderList();
}
function renderList(){
    let h="";
    playList.forEach((v,i)=>{
        h+=`<div class="play-list-item ${v.id==nowId?'active':''}" data-i="${i}" data-id="${v.id}">${v.name}-${v.auth}</div>`
    })
    $("#playListBox").html(h);
    $(".play-list-item").click(function(){
        playIndex=$(this).data("i");
        playSong($(this).data("id"));
    })
}
$("#clearPlayList").click(()=>{playList=[];renderList();})

function getLyric(id){
    $.get(`${host}/lyric?id=${id}`,res=>{
        $("#lyricBox").html(res.lyric.replace(/\n/g,"<br>"));
    })
}

$("#search-btn").click(()=>{
    let key=$("#search-input").val().trim();
    if(!key)return;
    $("#songListBox").html("<div class='loading'>搜索中...</div>");
    $.get(`${host}/search?keywords=${key}`,res=>{
        let h="";
        res.forEach(v=>{
            h+=`<div class="music-item" data-id="${v.id}">${v.name}-${v.artist}</div>`
        })
        $("#songListBox").html(h);bindSong();
    })
})
$("#search-input").keydown(e=>{if(e.keyCode==13)$("#search-btn").click();})

$(".quality-select").click(function(){
    $(".quality-select").removeClass("active");
    $(this).addClass("active");
    quality=$(this).data("q");
    if(nowId)playSong(nowId);
})

$("#downBtn").click(()=>{
    if(!nowUrl){alert("先播放歌曲");return;}
    let a=document.createElement("a");
    a.href=nowUrl;a.download=`${nowName}-${nowAuth}.mp3`;
    document.body.appendChild(a);a.click();a.remove();
})

$("#play").click(()=>audio.paused?audio.play():audio.pause());
$("#prev").click(()=>{
    if(playList.length<1)return;
    playIndex--;if(playIndex<0)playIndex=playList.length-1;
    playSong(playList[playIndex].id);
})
$("#next").click(()=>{
    if(playList.length<1)return;
    playIndex++;if(playIndex>=playList.length)playIndex=0;
    playSong(playList[playIndex].id);
})
audio.ontimeupdate=()=>{
    let p = (audio.currentTime/audio.duration)*100;
    $("#proBar").css("width",p+"%");
}
$("#vol").on("input",()=>audio.volume=$("#vol").val()/100)
