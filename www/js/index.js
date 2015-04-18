/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $(document).on("pageshow","#loginPage",function(){ // When entering pagetwo
            loginInit();
        });
        getDepartments();
        $("#graDis").change(function(e){
            getRotueDetails();
        });
        $('#loadingDiv').hide();
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        

        console.log('Received Event: ' + id);
    }
};

app.initialize();

function changePage(page){
        $(page).bind("callback", function(e, args) {
            alert(args.mydata);
        });
        $.mobile.changePage( $(page), "pop", true, true);
        $("page").trigger("callback");
    }

function handleLogin(type) {
        var form = $("#loginForm");  
        //$("#test").text("handleLogin hit");
        //disable the button so we can't resubmit while we wait
        if(type=="Nor")
        {
            $("#submitButton").button('disable');
        }
        var u = $("#username", form).val();
        var p = $("#password", form).val();
        console.log("click");
        if(u != '' && p!= '') {
            var jsonText = JSON.stringify({userName : u,passWord :p});
            $.ajax({
                type: "POST",
                url: "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/ValidateExpenseUser", // add web service Name and web service Method Name
                data: jsonText,  //web Service method Parameter Name and ,user Input value which in Name Variable.
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response)
                    {
                    if(response.d==true)
                        {
                            window.localStorage["username"] = u;
                            window.localStorage["password"] = p; 
                            changePage("#Graphs");
                            window.localStorage["userId"] = response;
                        }
                        else
                        {
                            alert("failed login");
                            $("#submitButton").button('enable');
                        }
                    },
                error: function(xhr, textStatus, error){
                    console.log(xhr.statusText);
                    console.log(textStatus);
                    console.log(error);
                    $("#submitButton").button('enable');
                    alert("Login Failed");
                    }      
            });
        } else {
            alert("You must enter a username and password", function() {});
            $("#submitButton").removeAttr("disabled");
        }
        return false;
    }
function getDepartments()
{
    
    var jsonText = JSON.stringify({});
    $.ajax({
        type: "POST",
        url: "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetDepartments", // add web service Name and web service Method Name
        data: {},  //web Service method Parameter Name and ,user Input value which in Name Variable.
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response)
            {
            if(response.d)
                {
                    var data = JSON.parse(response.d);
                    $.each(data, function(index, element)   {
                            $("#graDep").append('<option value='+element.DeptID+'>'+element.DeptName+'</option>');
                        });
                }
            },
        error: function (xhr, ajaxOptions, thrownError)
            {
                alert(xhr.status);
                alert(ajaxOptions);
                alert(thrownError);
            }
    });
}
$(function(ready){
    $("#graDep").change(function(e)
        {
            $('#graPro')
            .find('option')
            .remove()
            .end()
            .append('<option selected="selected" value="all">All</option>');
            $( "#graPro" ).val("Choose Route").change();
            var department = $("#graDep").val();
            if(department == "all")
            {
                return;
            }
            var jsonText = JSON.stringify({deptId : department});
            $.ajax({
                type: "POST",
                url: "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetProjectsInTheDepartment", // add web service Name and web service Method Name
                data: jsonText,  //web Service method Parameter Name and ,user Input value which in Name Variable.
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response)
                    {
                    if(response.d)
                        {
                            var data = JSON.parse(response.d);
                            $.each(data, function(index, element)   {
                                $("#graPro").append('<option value='+element.ProjectID+'>'+element.ProjectTitle+'</option>');
                            });
                            //alert(response.d.portId);
                            //changePage("#Consumption");
                            //window.localStorage["userId"] = response;
                        }
                    },
                error: function (xhr, ajaxOptions, thrownError)
                    {
                        alert(xhr.status);
                        alert(ajaxOptions);
                        alert(thrownError);
                    }
            }); 
        });
});


function graCosDataCheck(page)
{
    if(($("#"+page+"Dep").val() != "Choose Department") && (($("#"+page+"Pro").val() != "Choose Lift Station") && ($("#"+page+"Pro").val() != "")))
    {
        return true;
    }
    return false;
}
function GetDataForGraph(page)
{
    var graphDataCheck = graphDataValidation(page);
    var ajaxcalled = false;
    if((graCosDataCheck(page)==true) && (graphDataCheck ==true))
        {
            var projects = $("#"+page+"Pro").val() || [];
            var projectsString="";
            var numOfProjects = (projects.length);
            var department = $("#"+page+"Dep").val();
            var project = $("#"+page+"Pro").val();
            var graphSeries = $("#"+page+"SeriesType").val();
            var criteria;
            var criteriaValue;
            var fromDate = ($("#"+page+"fromDate").val()).split("-");
            var toDate = ($("#"+page+"toDate").val()).split("-");
            var jsonText1;
            var urlSelected;

            for(var i=0;i<projects.length;i++)
            {
                if(i==(projects.length-1))
                {
                    projectsString += projects[i];
                }
                else
                {
                    projectsString += projects[i]+",";
                }
                
            }

            if(department == "all")
            {
                if(graphSeries=="column")
                {
                    jsonText1 = JSON.stringify({fromMonth: fromDate[1],toMonth:toDate[1],fromYear:fromDate[0],toYear:toDate[0]});
                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetBarDiagramDataTableByParish"; // add web service Name and web service Method Name
                }
                else if (graphSeries == "line") 
                {
                    jsonText1 = JSON.stringify({fromMonth: fromDate[1],toMonth:toDate[1],fromYear:fromDate[0],toYear:toDate[0]});
                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetLineDiagramDataTableByParish"; // add web service Name and web service Method Name
                }
                else
                {
                    $("#pieChart1").empty();
                    $("#pieChart2").empty();
                    $("#pieChart3").empty();
                    $("#graChart").igDataChart();
                    $("#graChart").igDataChart( "destroy" );
                
                    $("#graHorizontalZoomSlider").val(1);
                    $("#graHorizontalZoomSlider").slider('refresh');

                    jsonText1 = JSON.stringify({fromMonth: fromDate[1],toMonth:toDate[1],fromYear:fromDate[0],toYear:toDate[0]});
                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetPieDiagramDataTableByParish";
                    ajaxForPie(urlSelected,jsonText1,"pieChart1",criteria);

                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetPieDiagramDataTableByParishProjects";
                    ajaxForPie(urlSelected,jsonText1,"pieChart2",criteria);

                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetPieDiagramDataTableByParishDepartments";
                    ajaxForPie(urlSelected,jsonText1,"pieChart3",criteria);

                    ajaxcalled = true;
                }
                criteria = "All Department";
                criteriaValue = "All";
            }
            else if(projects[0] == "all")
            {
                if(graphSeries=="column")
                {
                    jsonText1 = JSON.stringify({fromMonth: fromDate[1],toMonth:toDate[1],fromYear:fromDate[0],toYear:toDate[0],deptId:department});
                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetBarDiagramDataTableByDepartment"; // add web service Name and web service Method Name
                }
                else if (graphSeries == "line") 
                {
                    jsonText1 = JSON.stringify({fromMonth: fromDate[1],toMonth:toDate[1],fromYear:fromDate[0],toYear:toDate[0],deptId:department});
                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetLineDiagramDataTableByDepartment"; // add web service Name and web service Method Name
                }
                else
                {
                    $("#pieChart1").empty();
                    $("#pieChart2").empty();
                    $("#pieChart3").empty();
                    $("#graChart").igDataChart();
                    $("#graChart").igDataChart( "destroy" );
                
                    $("#graHorizontalZoomSlider").val(1);
                    $("#graHorizontalZoomSlider").slider('refresh');

                    jsonText1 = JSON.stringify({fromMonth: fromDate[1],toMonth:toDate[1],fromYear:fromDate[0],toYear:toDate[0],deptId:department});
                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetPieDiagramDataTableByDepartment";
                    ajaxForPie(urlSelected,jsonText1,"pieChart1",criteria);

                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetPieDiagramDataTableByEveryProject";
                    ajaxForPie(urlSelected,jsonText1,"pieChart2",criteria);

                    ajaxcalled = true;
                }
                criteria = "All Project";
                criteriaValue = department;
            }
            else
            {
                if(graphSeries=="column")
                {
                    jsonText1 = JSON.stringify({fromMonth: fromDate[1],toMonth:toDate[1],fromYear:fromDate[0],toYear:toDate[0],deptId:department, projectsString:projectsString,noOfprojects:numOfProjects});
                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetBarDiagramDataforMultipleProjects"; // add web service Name and web service Method Name
                }
                else if (graphSeries == "line") 
                {
                    jsonText1 = JSON.stringify({fromMonth: fromDate[1],toMonth:toDate[1],fromYear:fromDate[0],toYear:toDate[0],deptId:department, projectsString:projectsString,noOfprojects:numOfProjects});
                    urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetLineDiagramDataforMultipleProjects"; // add web service Name and web service Method Name
                }
                else
                {
                    if(numOfProjects>1)
                    {
                        alert("Select only one Project.");
                        ajaxcalled = true;
                    }
                    else
                    {
                        $("#pieChart1").empty();
                        $("#pieChart2").empty();
                        $("#pieChart3").empty();
                        $("#graChart").igDataChart();
                        $("#graChart").igDataChart( "destroy" );
                    
                        $("#graHorizontalZoomSlider").val(1);
                        $("#graHorizontalZoomSlider").slider('refresh');
                        jsonText1 = JSON.stringify({fromMonth: fromDate[1],toMonth:toDate[1],fromYear:fromDate[0],toYear:toDate[0],projectId:projects[0],deptId:department});
                        urlSelected = "http://thekbsystems.com/WorldPorts-SustainabilityForum/UserDetails.asmx/GetPieDiagramDataTable"; // add web service Name and web service Method Name
                    }
                }
                criteria = "Project";
                criteriaValue = project;
            }
            if(ajaxcalled == false)
            {
            $.ajax({
                    type: "POST",
                    url: urlSelected,
                    data: jsonText1,  //web Service method Parameter Name and ,user Input value which in Name Variable.
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response)
                        {
                        if(response.d)
                            {
                                var data = JSON.parse(response.d);
                                /*$.each(data, function(index, element)     {
                                        $("#conCategory").append('<option value='+element.categoryId+'>'+element.categoryName+'</option>');
                                    });*/
                                //alert(response.d.portId);
                                //changePage("#Consumption");
                                //window.localStorage["userId"] = response;
                                if(data.length>0)
                                {
                                    var rawData = data;
                                    if(graphSeries == "line" || graphSeries == "column")
                                    {
                                        if(criteria=="All Department" || criteria == "All Project")
                                        {
                                        igniteChart(data,graphSeries,page,criteria,criteriaValue);
                                        }
                                        else
                                        {
                                            igniteChartMulti(data,graphSeries,page,criteria,criteriaValue,projects,numOfProjects);   
                                        }
                                    }
                                    else
                                    {
                                        drawEnePieChart(data,page,criteria,"pieChart1");
                                    }
                                    
                                }
                                else
                                {
                                    alert("Data unavailable");
                                    return data;
                                }
                            }
                        },
                    error: function (xhr, ajaxOptions, thrownError)
                        {
                            alert(xhr.status);
                            alert(ajaxOptions);
                            alert(thrownError);
                            alert("Data unavailable");
                        }
                });
            }
        }
    else
    {
        alert("Enter Valid data");
    }    
}
function ajaxForPie(urlSelected,jsonText1,graphDiv,criteria)
{
    $.ajax({
                    type: "POST",
                    url: urlSelected,
                    data: jsonText1,  //web Service method Parameter Name and ,user Input value which in Name Variable.
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response)
                        {
                        if(response.d)
                            {
                                var data = JSON.parse(response.d);
                                /*$.each(data, function(index, element)     {
                                        $("#conCategory").append('<option value='+element.categoryId+'>'+element.categoryName+'</option>');
                                    });*/
                                //alert(response.d.portId);
                                //changePage("#Consumption");
                                //window.localStorage["userId"] = response;
                                if(data.length>0)
                                {
                                    drawEnePieChart(data,"gar",criteria,graphDiv);
                                }
                                else
                                {
                                    alert("Data unavailable");
                                    return data;
                                }
                            }
                        },
                    error: function (xhr, ajaxOptions, thrownError)
                        {
                            alert(xhr.status);
                            alert(ajaxOptions);
                            alert(thrownError);
                            alert("Data unavailable");
                        }
                });
}
function drawEnePieChart(data,page,criteria,grapDiv)
{

    $("#eneLoadingDiv").css("display","none");
    google.load("visualization", "1", {packages:["corechart"]});



        var data2 = [
          ['Task', 'Hours per Day'],
          ['Work',     11],
          ['Eat',      2],
          ['Commute',  2],
          ['Watch TV', 2],
          ['Sleep',    7]
        ];
        var data1;
        var key;
        data1= [["Key","Value"]];
        var title = "Pie chart";
        if(data[0].Month!=undefined)
        {
            key = "Month";
            title = "Month wise Pie Diagram";
        } 
        else if(data[0].ProjectID!=undefined)
        {
            key = "ProjectID";
            title = "Project wise Pie Diagram";
        }
        else
        {
            key = "DeptID";
            title = "Department wise Pie Diagram";
        }
        for(i=0;i<data.length;i++)
        {
            if(key == "DeptID")
            {
                data1[i+1] = [$("#graDep option[value='"+data[i][key]+"']").text()+" ",data[i].Amount];    
            }
            else if(key == "ProjectID")
            {
                data1[i+1] = [$("#graPro option[value='"+data[i][key]+"']").text()+" ",data[i].Amount];    
            }
            else
            {
                data1[i+1] = [(getMonth(data[i][key])+""+(data[i].year)),data[i].Amount];
            }
        }
        var data = google.visualization.arrayToDataTable(data1);
        
        /*if(cir == "cost")
        {
            title += " Cost Comparision";
        }
        else
        {
            title += " Energy Consumption Comparision";
        }*/
        var options = {
          legend: 'center',  
          title: title,
          is3D: true,
          backgroundColor: { fill:'transparent' }
        };

        var chart = new google.visualization.PieChart(document.getElementById(grapDiv));

        chart.draw(data, options);
      
}
function graphDataValidation(Page)
    {
        if($("#"+Page+"fromDate").val() != "")
        {
            var fromDate = ($("#"+Page+"fromDate").val()).split("-");
            if($("#"+Page+"toDate").val() != "")
            {
                var toDate = ($("#"+Page+"toDate").val()).split("-");
                if(fromDate[0]<=toDate[0])
                {
                    if(fromDate[0]==toDate[0])
                    {
                        if(fromDate[1]<=toDate[1])
                        {
                            if(fromDate[1]==toDate[1])
                            {
                                if(fromDate[2]<=toDate[2])
                                {
                                    return true;
                                }
                                else
                                {
                                    return false;
                                }
                            }
                            else
                            {
                                return true;
                            }
                        }
                        else
                        {
                            return false;
                        }
                            
                    }
                    else
                    {
                        return true;
                    }
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }

function getMonth(value)
{
    switch(value)
    {
        case 1:
            return "Jan";
        case 2:
            return "Feb";
        case 3:
            return "Mar";
        case 4:
            return "Apr";
        case 5:
            return "May";
        case 6:
            return "Jun";
        case 7:
            return "Jul";
        case 8:
            return "Aug";
        case 9:
            return "Sep";
        case 10:
            return "Oct";
        case 11:
            return "Nov";
        case 12:
            return "Dec";
        default:
            return;    
    }
}
function igniteChart(rawData,seriesType,Page,criteria,criteriaValue)
    {
            $(function () {
                $("#"+Page+"Chart").igDataChart();
                $("#"+Page+"Chart").igDataChart( "destroy" );
                $("#pieChart1").empty();
                $("#pieChart2").empty();
                $("#pieChart3").empty();

                $("#"+Page+"HorizontalZoomSlider").val(1);
                $("#"+Page+"HorizontalZoomSlider").slider('refresh');
                //var varSelName = getVariableName(varSel);
                
                var title;
                var seriesTitle;
                var seriesType = $("#"+Page+"SeriesType").val();
                var graphData = [];
                var avg = rawData[0]["Amount"];
                if(seriesType == "column")
                {
                    if(criteria == "All Department")
                    {
                        title = "Parish County Expense Graph";
                        seriesTitle = "Parish County";
                    }
                    else if(criteria == "All Project")
                    {
                        title = $("#"+Page+"Dep option:selected").text()+" Expense Graph";
                        seriesTitle = $("#"+Page+"Dep option:selected").text();
                    }
                    else
                    {
                        title = $("#"+Page+"Pro option:selected").text()+" Expense Graph";
                        seriesTitle = $("#"+Page+"Pro option:selected").text();
                    }
                }
                else
                {
                    if(criteria == "All Department")
                    {
                        title = "Parish County Expense Cumulative Graph";
                        seriesTitle = "Parish County";
                    }
                    else if(criteria == "All Project")
                    {
                        title = $("#"+Page+"Dep option:selected").text()+" Expense Cumulative Graph";
                        seriesTitle = $("#"+Page+"Dep option:selected").text();
                    }
                    else
                    {
                        title = $("#"+Page+"Pro option:selected").text()+" Expense Cumulative Graph";
                        seriesTitle = $("#"+Page+"Pro option:selected").text();
                    }
                }
                var marker = "none";
                var thickness = 5;
                var seriesType = $("#"+Page+"SeriesType").val();
                if (seriesType == "area" ||
                    seriesType == "splineArea" ||
                    seriesType == "column" ||
                    seriesType == "waterfall" ||
                    seriesType == "point" ||
                    seriesType == "stepArea") 
                    {
                        thickness = 1;
                    }
                if (seriesType == "point") 
                    {
                        marker = "circle";
                    }
                
                for(i=0;i<rawData.length;i++)
                {
                    var Date = getMonth(rawData[i].Month)+""+(rawData[i].year);
                    graphData[i] = {Date: Date};
                    graphData[i]["value"] = rawData[i]["Amount"];
                    if(avg>rawData[i]["Amount"])
                        {
                            avg = rawData[i].Amount;
                        }
                }
                
                /*var series[] = [{
                                name: "ExpenseValue",
                                type: $("#"+Page+"SeriesType").val(),
                                title: seriesTitle,
                                xAxis: "DateAxis",
                                yAxis: "CatAxis",
                                showTooltip: true,
                                valueMemberPath: "value",
                                markerType: marker,
                                isTransitionInEnabled: true,
                                isHighlightingEnabled: true,
                                thickness: thickness
                            }];*/
           

                

                var data = [
                    { "CountryName": "China", "Pop1995": 1216, "Pop2005": 1297, "Pop2015": 1361, "Pop2025": 1394 },
                    { "CountryName": "India", "Pop1995": 920, "Pop2005": 1090, "Pop2015": 1251, "Pop2025": 1396 },
                    { "CountryName": "United States", "Pop1995": 266, "Pop2005": 295, "Pop2015": 322, "Pop2025": 351 },
                    { "CountryName": "Indonesia", "Pop1995": 197, "Pop2005": 229, "Pop2015": 256, "Pop2025": 277 },
                    { "CountryName": "Brazil", "Pop1995": 161, "Pop2005": 186, "Pop2015": 204, "Pop2025": 218 }
                ];

                $("#"+Page+"Chart").igDataChart({
                    legend: { element: Page+"LineLegend" },
                    title: title,
                    horizontalZoomable: true,
                    verticalZoomable: true,
                    dataSource: graphData,
                    axes: [
                        {
                            name: "DateAxis",
                            type: "categoryX",
                            label: "Date"
                        },
                        {
                            name: "CatAxis",
                            type: "numericY", 
                            minimumValue: avg-1000,
                            title: "Units",
                        }
                    ],
                    series: [{
                                name: "ExpenseValue",
                                type: $("#"+Page+"SeriesType").val(),
                                title: seriesTitle,
                                xAxis: "DateAxis",
                                yAxis: "CatAxis",
                                showTooltip: true,
                                valueMemberPath: "value",
                                markerType: marker,
                                isTransitionInEnabled: true,
                                isHighlightingEnabled: true,
                                thickness: thickness
                            }]
                        
                });
                $("#"+Page+"Chart").igDataChart("resetZoom");

                $("#"+Page+"Chart").igDataChart({defaultInteraction: "dragPan"});
                
                
                $("#"+Page+"HorizontalZoomSlider").change(function (e) {
                    var val = $("#"+Page+"HorizontalZoomSlider").val();
                    val = Math.abs(val-101);
                    val = val/100;
                    $("#"+Page+"Chart").igDataChart("option", "windowScaleVertical", 1);
                    $("#"+Page+"Chart").igDataChart("option", "windowScaleHorizontal", val);
                });
            }); 
    }    
function igniteChartMulti(rawData,seriesType,Page,criteria,criteriaValue,porjectIds,numOfProjects)
    {
    $(function () {
        $("#"+Page+"Chart").igDataChart();
        $("#"+Page+"Chart").igDataChart( "destroy" );
        $("#pieChart1").empty();
        $("#pieChart2").empty();
        $("#pieChart3").empty();

        $("#"+Page+"HorizontalZoomSlider").val(1);
        $("#"+Page+"HorizontalZoomSlider").slider('refresh');
        //var varSelName = getVariableName(varSel);
        
        var title;
        var seriesTitle;
        var seriesType = $("#"+Page+"SeriesType").val();
        var graphData = [];
        var avg = rawData[0]["Amount"];
        var monthsCount = (rawData.length)/numOfProjects;
        if(seriesType == "column")
        {
            if(criteria == "All Department")
            {
                title = "Parish County Expense Graph";
                seriesTitle = "Parish County";
            }
            else if(criteria == "All Project")
            {
                title = $("#"+Page+"Dep option:selected").text()+" Expense Graph";
                seriesTitle = $("#"+Page+"Dep option:selected").text();
            }
            else
            {
                if(numOfProjects == 1)
                {
                    title = $("#"+Page+"Pro option:selected").text()+" Expense Graph";
                    seriesTitle = $("#"+Page+"Pro option:selected").text();
                }
                else
                {
                    title = "Projects Comparision Expense Graph";
                    seriesTitle = $("#"+Page+"Pro option:selected").text();
                }
            }
        }
        else
        {
            if(criteria == "All Department")
            {
                title = "Parish County Expense Cumulative Graph";
                seriesTitle = "Parish County";
            }
            else if(criteria == "All Project")
            {
                title = "Projects Comparision Expense Cumulative Graph";
                seriesTitle = $("#"+Page+"Dep option:selected").text();
            }
            else
            {
                if(numOfProjects == 1)
                {
                    title = $("#"+Page+"Pro option:selected").text()+" Expense Cumulative Graph";
                    seriesTitle = $("#"+Page+"Pro option:selected").text();
                }
                else
                {
                    title = "Projects Comparision Expense Cumulative Graph";
                    seriesTitle = $("#"+Page+"Pro option:selected").text();
                }
            }
        }
        var marker = "none";
        var thickness = 5;
        var seriesType = $("#"+Page+"SeriesType").val();
        if (seriesType == "area" ||
            seriesType == "splineArea" ||
            seriesType == "column" ||
            seriesType == "waterfall" ||
            seriesType == "point" ||
            seriesType == "stepArea") 
            {
                thickness = 1;
            }
        if (seriesType == "point") 
            {
                marker = "circle";
            }
        if(numOfProjects == 1)
        {
            for(i=0;i<rawData.length;i++)
            {
                var Date = getMonth(rawData[i].Month)+""+(rawData[i].year);
                var projectValue = "Project"+rawData[i].projectId+"Value";
                graphData[i] = {Date: Date};
                graphData[i][projectValue] = rawData[i]["Amount"];
                if(avg>rawData[i]["Amount"])
                    {
                        avg = rawData[i].Amount;
                    }
            }
        }
        else
        {
            for(i=0;i<monthsCount;i++)
            {
                var Date = getMonth(rawData[i].Month)+""+(rawData[i].year);
                graphData[i] = {Date: Date};
            }
            i=0;
            while(i<rawData.length)
            {
                var projectValue = "Project"+rawData[i].projectId+"Value";
                for(j=0;j<monthsCount;j++)
                {
                    graphData[j][projectValue] = rawData[i]["Amount"];
                    if(avg>rawData[i]["Amount"])
                    {
                        avg = rawData[i]["Amount"];
                    }
                    i++;
                }
            }
        }
        var series = [];
        for(i=0;i<numOfProjects;i++)
        {
            var projectId = porjectIds[i];
            var projectName;
            var projectValue = "Project"+projectId+"Value";
            portName = $("#graPro option[value='"+projectId+"']").text();
            series[i]= {
                        name: portName,
                            type: seriesType,
                            title: portName,
                            xAxis: "DateAxis",
                            yAxis: "CatAxis",
                            valueMemberPath: projectValue,
                            markerType: marker,
                            isTransitionInEnabled: true,
                            isHighlightingEnabled: true,
                            thickness: thickness
                        }
        }
   
        var data = [
            { "CountryName": "China", "Pop1995": 1216, "Pop2005": 1297, "Pop2015": 1361, "Pop2025": 1394 },
            { "CountryName": "India", "Pop1995": 920, "Pop2005": 1090, "Pop2015": 1251, "Pop2025": 1396 },
            { "CountryName": "United States", "Pop1995": 266, "Pop2005": 295, "Pop2015": 322, "Pop2025": 351 },
            { "CountryName": "Indonesia", "Pop1995": 197, "Pop2005": 229, "Pop2015": 256, "Pop2025": 277 },
            { "CountryName": "Brazil", "Pop1995": 161, "Pop2005": 186, "Pop2015": 204, "Pop2025": 218 }
        ];

        $("#"+Page+"Chart").igDataChart({
            legend: { element: Page+"LineLegend" },
            title: title,
            horizontalZoomable: true,
            verticalZoomable: true,
            dataSource: graphData,
            axes: [
                {
                    name: "DateAxis",
                    type: "categoryX",
                    label: "Date"
                },
                {
                    name: "CatAxis",
                    type: "numericY", 
                    minimumValue: avg-1000,
                    title: "Units",
                }
            ],
            series: series
                
        });
        $("#"+Page+"Chart").igDataChart("resetZoom");

        $("#"+Page+"Chart").igDataChart({defaultInteraction: "dragPan"});
        
        
        $("#"+Page+"HorizontalZoomSlider").change(function (e) {
            var val = $("#"+Page+"HorizontalZoomSlider").val();
            val = Math.abs(val-101);
            val = val/100;
            $("#"+Page+"Chart").igDataChart("option", "windowScaleVertical", 1);
            $("#"+Page+"Chart").igDataChart("option", "windowScaleHorizontal", val);
        });
    }); 
}        
function checkPreAuth() {
        var form = $("#loginForm");
        if((window.localStorage["username"] != undefined && window.localStorage["password"] != undefined)&&(window.localStorage["username"] != "" && window.localStorage["password"] != "")) {
            $("#username", form).val(window.localStorage["username"]);
            $("#password", form).val(window.localStorage["password"]);
            handleLogin("Pre");
        }
    }
function deviceReady() 
    {
        $("#loginForm").on("submit",handleLogin);
        //getPortNamesAndCat();
        
    }
function loginInit()
    {
        $('#password').val("");
        $('#username').val("");
        $("#submitButton").button('enable');
        $("#submitButton").removeClass('active');
        $("#submitButton").trigger("create");
    }
function search(page)
    {
        var loc = lif ="";
        loc = $("#"+page+"SeaLoc").val();
        lif = $("#"+page+"SeaLif").val();
        if(loc!='')
        {
             //alert("Values: "+loc+" "+lif);
             $("#"+page+"Search").popup("close");
             var jsonText = JSON.stringify({location : loc});
            $.ajax({
                type: "POST",
                url: "http://thekbsystems.com/JPEOpti/JPOpti.asmx/GetLiftStationByLocation", // add web service Name and web service Method Name
                data: jsonText,  //web Service method Parameter Name and ,user Input value which in Name Variable.
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response)
                    {
                    if(response.d)
                        {
                            var data = JSON.parse(response.d);
                            if(data.length>0 && (!(data[0].hasOwnProperty('Error'))))
                            {
                                $("#"+page+"LiftSt")
                                    .find('option')
                                    .remove()
                                    .end();
                                    $.each(data, function(index, element)   {
                                        $("#"+page+"LiftSt").append('<option value='+element.Ls_Id+'>'+element.Ls_Id+'</option>');
                                    });
                                    $("#"+page+"LiftSt").val($("#"+page+"LiftSt option:first").val()).change();
                            }
                            else
                            {
                                alert("No matching Lift Station Id in this location.");
                            }
                        }
                    },
                error: function (xhr, ajaxOptions, thrownError)
                    {
                        alert(xhr.status);
                        alert(ajaxOptions);
                        alert(thrownError);
                    }
            }); 
             //changePage("Graphs");
        }
        else if(lif!='')
        {
             //alert("Values: "+loc+" "+lif);
             $("#"+page+"Search").popup("close");
             var jsonText = JSON.stringify({ liftStationId : lif});
             $.ajax({
                type: "POST",
                url: "http://thekbsystems.com/JPEOpti/JPOpti.asmx/GetPumpIdsByLiftstation", // add web service Name and web service Method Name
                data: jsonText,  //web Service method Parameter Name and ,user Input value which in Name Variable.
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response)
                    {
                    if(response.d)
                        {
                            var data = JSON.parse(response.d);
                            if(data.length>0)
                            {
                                $("#"+page+"LiftSt")
                                    .find('option')
                                    .remove()
                                    .end();
                                $("#"+page+"LiftSt").append('<option value='+lif+'>'+lif+'</option>');
                                $("#"+page+"LiftSt").val($("#graLiftSt option:first").val()).change();
                                $("#"+page+"Pump")
                                    .find('option')
                                    .remove()
                                    .end();
                                $.each(data, function(index, element)   {
                                    $("#"+page+"Pump").append('<option value='+element.Ls_Id+'>'+element.P_Id+'</option>');
                                });
                            }
                            else
                            {
                                alert("No matching Pumps for this Lift Station Id.");
                            }

                        }
                    },
                error: function (xhr, ajaxOptions, thrownError)
                    {
                        alert(xhr.status);
                        alert(ajaxOptions);
                        alert(thrownError);
                    }
            }); 
        }
        else
        {
            alert("Enter Valid Data.");
        }
    }