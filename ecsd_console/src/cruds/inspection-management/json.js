
export const json = {
    "title": "SWMP",
    "completedHtml": "",
    "pages": [
     {
      "name": "page0",
      "elements": [
       {
        "type": "text",
        "name": "client_name",
        "title": "Client:",
        "readOnly": true
       },
       {
        "type": "text",
        "name": "project_name",
        "title": "Project:",
        "readOnly": true
       },
       {
        "type": "text",
        "name": "document_number",
        "title": "Document No:",
        "readOnly": true
       },
       {
        "type": "text",
        "name": "inspection_date",
        "title": "Conducted On:",
        "readOnly": true,
        "inputType": "date"
       },
       {
        "type": "text",
        "name": "inspection_location",
        "title": "Location:",
        "readOnly": true
       },
       {
        "type": "panel",
        "name": "project_permit_panel",
        "elements": [
         {
          "type": "text",
          "name": "permit",
          "title": "Permits",
          "readOnly": true
         }
        ]
       },
       {
        "type": "text",
        "name": "prepared_by",
        "title": "Prepared By:",
        "readOnly": true
       },
       {
        "type": "panel",
        "name": "inspectors_panel",
        "elements": [
         {
          "type": "text",
          "name": "inspectors",
          "title": "Inspectors",
          "readOnly": true
         }
        ]
       }
      ],
      "visible": false,
      "title": "Information"
     },
     {
      "name": "page1",
      "elements": [
       {
        "type": "checkbox",
        "name": "weather",
        "title": "Weather at the time of inspection",
        "description": "Please select no more than three features.",
        "isRequired": true,
        "validators": [
         {
          "type": "answercount",
          "text": "Please select no more than three features.",
          "maxCount": 3
         }
        ],
        "choices": [
         {
          "value": "clear",
          "text": "Clear"
         },
         {
          "value": "overcast",
          "text": "Overcast"
         },
         {
          "value": "rain",
          "text": "Rain"
         },
         {
          "value": "snow",
          "text": "Snow"
         }
        ],
        "otherText": "Other features:",
        "colCount": 2
       },
       {
        "type": "dropdown",
        "name": "inspection_type",
        "title": "Type of Inspection",
        "choices": [
         {
          "value": "weekly",
          "text": "Weekly Routine Inspection"
         },
         {
          "value": "runoff24",
          "text": "Runoff Event - 24 hour"
         },
         {
          "value": "winterx",
          "text": "Winter Condition Exclusion"
         },
         {
          "value": "3rdparty",
          "text": "Third Party Inspection"
         },
         {
          "value": "runoff72",
          "text": "Runoff Event - 72 hour"
         },
         {
          "value": "initial",
          "text": "Initial Inspection"
         }
        ]
       },
       {
        "type": "panel",
        "name": "panel1",
        "elements": [
         {
          "type": "text",
          "name": "precip_start_date",
          "title": "Precipitation Start Date",
          "inputType": "date"
         },
         {
          "type": "text",
          "name": "precip_stop_date",
          "title": "Precipitation Stop Date",
          "inputType": "date"
         },
         {
          "type": "dropdown",
          "name": "runoff_type",
          "title": "Type of Runoff",
          "choices": [
           {
            "value": "rain",
            "text": "Rain"
           },
           {
            "value": "snowmelt",
            "text": "Snow Melt"
           }
          ]
         },
         {
          "type": "text",
          "name": "amount_of_precipitation",
          "title": "Amount of Precipitation"
         }
        ],
        "visibleIf": "{inspection_type} = 'runoff24' or {inspection_type} = 'runoff72'"
       },
       {
        "type": "checkbox",
        "name": "current_site_activities",
        "title": "Current Site Activities",
        "choices": [
         {
          "value": "clearing_grubbing",
          "text": "Clearing and Grubbing"
         },
         {
          "value": "grading",
          "text": "Grading"
         },
         {
          "value": "bmp_installation",
          "text": "BPM Installation"
         },
         {
          "value": "removals",
          "text": "Removals"
         },
         {
          "value": "excavation",
          "text": "Excavation"
         },
         {
          "value": "wet_utility",
          "text": "Wet Utility Work"
         },
         {
          "value": "dry_utility",
          "text": "Dry Utility Work"
         },
         {
          "value": "concrete",
          "text": "Concrete Work"
         },
         {
          "value": "track_work",
          "text": "Track Work"
         },
         {
          "value": "drilling_boring",
          "text": "Drilling/Boring"
         },
         {
          "value": "road_construction",
          "text": "Road Construction"
         },
         {
          "value": "system_work",
          "text": "System Work"
         },
         {
          "value": "no_work",
          "text": "No Work"
         },
         {
          "value": "indoor_work",
          "text": "Indoor Work"
         }
        ]
       },
       {
        "type": "boolean",
        "name": "qualified_person",
        "title": "Is the Inspector a \"Qualified Person\" in accordance with 3.2.1?"
       },
       {
        "type": "boolean",
        "name": "installation_of_controls",
        "title": "Have all site activities begin with proper installation of sediment and perimeter controls?"
       },
       {
        "type": "panel",
        "name": "proper_installion_panel",
        "elements": [
         {
          "type": "text",
          "name": "missing_control_area",
          "title": "Area with missing control"
         },
         {
          "type": "paneldynamic",
          "name": "sediment_controls_panel",
          "title": "Sediment Control",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_missing_control",
            "title": "Picture of Missing - Control",
            "sourceType": "file-camera"
           },
           {
            "type": "text",
            "name": "description_of_need",
            "title": "Description of Operational and Maintenance needed"
           },
           {
            "type": "text",
            "name": "sediment_control_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{installation_of_controls} = false"
       },
       {
        "type": "boolean",
        "name": "stockpiles_protected",
        "title": "Are all stockpiles protected relevant to their location?"
       },
       {
        "type": "panel",
        "name": "stockpile_protected_panel",
        "elements": [
         {
          "type": "text",
          "name": "stockpile_location",
          "title": "Stockpile Location"
         },
         {
          "type": "paneldynamic",
          "name": "stockpile_protected_dyno_panel",
          "title": "Stockpile",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_stockpile",
            "title": "Picture of stockpile"
           },
           {
            "type": "text",
            "name": "description_of_stockpile_need",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "stockpile_actions_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{stockpiles_protected} = false"
       },
       {
        "type": "boolean",
        "name": "sediment_accumulation",
        "title": "Do all perimetor controls ahve less than one-half sediment accululation of the above ground height?"
       },
       {
        "type": "panel",
        "name": "sediment_accumulation_panel",
        "elements": [
         {
          "type": "text",
          "name": "sediment_location",
          "title": "Areas where sediment accumulation is occuring"
         },
         {
          "type": "paneldynamic",
          "name": "sediment_accumulatoin_dyno_panel",
          "title": "Sediment Acccumulation",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_sediment_accumulation",
            "title": "Picture of sediment accumulation"
           },
           {
            "type": "text",
            "name": "description_of_sediment_need",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "sediment_actions_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{sediment_accumulation} = false"
       },
       {
        "type": "boolean",
        "name": "sediment_tracking",
        "title": "Is Sediment track-out on streets, paved areas, and sidewalks minimized?"
       },
       {
        "type": "panel",
        "name": "sediment_tracking_panel",
        "elements": [
         {
          "type": "text",
          "name": "tracking_location",
          "title": "Areas where tracking is occuring"
         },
         {
          "type": "paneldynamic",
          "name": "sediment_panel",
          "title": "Tracking",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_tracking",
            "title": "Picture of tracking"
           },
           {
            "type": "text",
            "name": "description_of_tracking_need",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "tracking_actions_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{sediment_tracking} = false"
       },
       {
        "type": "boolean",
        "name": "access_points",
        "title": "Is all construction traffic access limited to designated VTCs and pedestrian access points?"
       },
       {
        "type": "panel",
        "name": "access_point_panel",
        "elements": [
         {
          "type": "text",
          "name": "access_location",
          "title": "Areas where non-designated access is occuring"
         },
         {
          "type": "paneldynamic",
          "name": "access_panel",
          "title": "Non_Designated Access",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_access",
            "title": "Picture of non-designated access"
           },
           {
            "type": "text",
            "name": "description_of_access_need",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "access_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{access_points} = false"
       },
       {
        "type": "boolean",
        "name": "fugitive_dust",
        "title": "Is fugitive dust being minimized?"
       },
       {
        "type": "panel",
        "name": "fugitive_dust_panel",
        "elements": [
         {
          "type": "text",
          "name": "fugitive_dust_location",
          "title": "Fugitive dust location"
         },
         {
          "type": "paneldynamic",
          "name": "dust_panel",
          "title": "Fugitive Dust",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_fugitive_dust",
            "title": "Picture of fugitive dust"
           },
           {
            "type": "text",
            "name": "description_of_fugitive_dust_need",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "fugitive_dust_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{fugitive_dust} = false"
       },
       {
        "type": "boolean",
        "name": "sidiment_deposit",
        "title": "Are discharge points and receiving waters free of any sediment deposits or pollutants?"
       },
       {
        "type": "panel",
        "name": "sediment_deposit_panel",
        "elements": [
         {
          "type": "text",
          "name": "sidiment_deposit_location",
          "title": "Discharge location"
         },
         {
          "type": "paneldynamic",
          "name": "sidiment_deposit_dyno_panel",
          "title": "Sediment/Pollutant",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_sediment_deposit",
            "title": "Picture of sediment/pollutant"
           },
           {
            "type": "text",
            "name": "description_of_sidiment_deposit_need",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "sidiment_deposit_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{sidiment_deposit} = false"
       },
       {
        "type": "boolean",
        "name": "dewatering",
        "title": "Is there any discharging groundwater of accumulated stormwater that is removed from excavations, trenches, foundations, vaults or other similar points?"
       },
       {
        "type": "boolean",
        "name": "dewatering_compliance",
        "visibleIf": "{dewatering} = true",
        "title": "Is the dewatering in compliance with the discharge?"
       },
       {
        "type": "panel",
        "name": "dewatering_panel",
        "elements": [
         {
          "type": "text",
          "name": "dewatering_location",
          "title": "Dewatering location"
         },
         {
          "type": "paneldynamic",
          "name": "dewatering_dyno_panel",
          "title": "Dewatering",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_dewatering",
            "title": "Picture of dewatering"
           },
           {
            "type": "text",
            "name": "description_of_dewatering",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "dewatering_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{dewatering_compliance} = false"
       },
       {
        "type": "boolean",
        "name": "soil_stabilization",
        "title": "Have soil stabilization measures been initiated if earth disturbing activites have permanently or termporarily ceased (14 days)?"
       },
       {
        "type": "panel",
        "name": "soil_stabilization_panel",
        "elements": [
         {
          "type": "text",
          "name": "soil_stabilization_area",
          "title": "Soil Stabilization Area"
         },
         {
          "type": "paneldynamic",
          "name": "soil_stabilization_dyno_panel",
          "title": "Soil Stabilization",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_soil_stabilization",
            "title": "Picture of area needing stabilization"
           },
           {
            "type": "text",
            "name": "description_of_soil_stabilization_need",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "soil_stabilization_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{soil_stabilization} = false"
       },
       {
        "type": "boolean",
        "name": "toxic_materials",
        "title": "Are any of the following being generated on site: concrete wash water, wastewater pain cleanout, oils, fuels, soaps, solvents, detergents, or other toxic substances prohibited by City of Aurora Stormwater Rules and Regulations Manual?"
       },
       {
        "type": "boolean",
        "name": "toxic_materials_compliance",
        "visibleIf": "{toxic_materials} = true",
        "title": "Are  materials being properly maintained?"
       },
       {
        "type": "panel",
        "name": "toxic_materials_panel",
        "elements": [
         {
          "type": "text",
          "name": "toxic_materials_list",
          "title": "unmaintained toxic material"
         },
         {
          "type": "paneldynamic",
          "name": "toxic_materials_dyno_panel",
          "title": "Toxic Substances",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_toxic_materials",
            "title": "Picture of regulated substance"
           },
           {
            "type": "text",
            "name": "description_of_toxic_materials",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "toxic_materials_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{toxic_materials_compliance} = false"
       },
       {
        "type": "boolean",
        "name": "equipment_maintenance",
        "title": "Are equipment or vehicles being fueled and/or maintained on site?"
       },
       {
        "type": "boolean",
        "name": "equipment_maintenance_compliance",
        "visibleIf": "{equipment_maintenance} = true",
        "title": "Are effective means of eliminating the discharges of spilled or leaked chemicals being utilized? i.e. drip pans, spill supplies"
       },
       {
        "type": "panel",
        "name": "equipment_maintenance_panel",
        "elements": [
         {
          "type": "text",
          "name": "equipment_maintenance_areas",
          "title": "Preventative measures in equipment areas"
         },
         {
          "type": "paneldynamic",
          "name": "equipment_maintenance_dyno_panel",
          "title": "Equipment Maintenance",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_equipment_maintenance",
            "title": "Picture of maintenance and fueling areas"
           },
           {
            "type": "text",
            "name": "description_of_equipment_maintenance",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "equipment_maintenance_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{equipment_maintenance_compliance} = false"
       },
       {
        "type": "boolean",
        "name": "equipment_spill_free",
        "visibleIf": "{equipment_maintenance} = true",
        "title": "Are vehicle equipment fueling, cleaning, and maintenance areas free of spills, leaks, or any other deleterious materials?"
       },
       {
        "type": "panel",
        "name": "equipment_spill_panel",
        "elements": [
         {
          "type": "text",
          "name": "equipment_spill_areas",
          "title": "Spill/Leak in Equipment Areas"
         },
         {
          "type": "paneldynamic",
          "name": "equipment_spill_dyno_panel",
          "title": "Spill Leak ",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_equipment_spill",
            "title": "Picture of spill/leak"
           },
           {
            "type": "text",
            "name": "description_of_equipment_spill",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "equipment_spill_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{equipment_spill_free} = false"
       },
       {
        "type": "boolean",
        "name": "trash_collected",
        "title": "Is trash/litter being collected and placed in dumpsters?"
       },
       {
        "type": "panel",
        "name": "trash_litter_panel",
        "elements": [
         {
          "type": "text",
          "name": "trash_litter_location",
          "title": "Areas with trash/litter"
         },
         {
          "type": "paneldynamic",
          "name": "trash_litter_dyno_panel",
          "title": "Trash/Litter",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_trash_litter",
            "title": "Picture of Trash/Litter"
           },
           {
            "type": "text",
            "name": "description_of_trash_litter",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "trash_litter_actions_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{trash_collected} = false"
       },
       {
        "type": "boolean",
        "name": "washout_available",
        "title": "Are washout facilities (e.g. paint, stucco, concrete) available and maintained?"
       },
       {
        "type": "panel",
        "name": "washout_available_panel",
        "elements": [
         {
          "type": "text",
          "name": "washout_available_location",
          "title": "Washout Facility"
         },
         {
          "type": "paneldynamic",
          "name": "washout_available_dyno_panel",
          "title": "Washout",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_washout_facility",
            "title": "Picture of Unmaintained Washout"
           },
           {
            "type": "text",
            "name": "description_of_washout_available",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "washout_available_actions_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{washout_available} = false"
       },
       {
        "type": "boolean",
        "name": "erosion_free",
        "title": "Is the project site and adjacent property free of visible erosion?"
       },
       {
        "type": "panel",
        "name": "erosion_free_panel",
        "elements": [
         {
          "type": "text",
          "name": "erosion_free_location",
          "title": "Area of visible erosion"
         },
         {
          "type": "paneldynamic",
          "name": "erosion_free_dyno_panel",
          "title": "Erosion",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_erosion_free",
            "title": "Picture of erosion"
           },
           {
            "type": "text",
            "name": "description_of_erosion_free",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "erosion_free_actions_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{erosion_free} = false"
       },
       {
        "type": "boolean",
        "name": "bpm_containment",
        "title": "Are all BMPs and containers in proper working order to prevent spills, leaks, or other accumulations of pollutants?"
       },
       {
        "type": "panel",
        "name": "bpm_containment_panel",
        "elements": [
         {
          "type": "text",
          "name": "bpm_containment_location",
          "title": "Area of insufficient BML/containment"
         },
         {
          "type": "paneldynamic",
          "name": "bpm_containment_dyno_panel",
          "title": "Containment",
          "templateElements": [
           {
            "type": "file",
            "name": "pic_bpm_containment",
            "title": "Picture of BMP/Containment"
           },
           {
            "type": "text",
            "name": "description_of_bpm_containment",
            "title": "Description of Location and Maintenance needed"
           },
           {
            "type": "text",
            "name": "bpm_containment_actions_date_initials",
            "title": "Actions taken, Date, Initials"
           }
          ]
         }
        ],
        "visibleIf": "{bpm_containment} = false"
       },
       {
        "type": "boolean",
        "name": "permit_compliance",
        "title": "Are all other conditions on site in compliance with the permit?"
       },
       {
        "type": "paneldynamic",
        "name": "permit_compliance_dyno_panel",
        "visibleIf": "{permit_compliance} = false",
        "title": "Other Item to be addressed",
        "templateElements": [
         {
          "type": "file",
          "name": "pic_permit_compliance",
          "title": "Picture of area of concern"
         },
         {
          "type": "text",
          "name": "description_of_permit_compliance",
          "title": "Description of item to be addressed and Location"
         },
         {
          "type": "text",
          "name": "permit_compliance_actions_date_initials",
          "title": "Actions taken, Date, Initials"
         }
        ]
       },
       {
        "type": "boolean",
        "name": "inspected_all_areas",
        "title": "Have you inspected ALL areas that have been cleared, graded, or excavated and that have not yet completed stabilization?"
       },
       {
        "type": "boolean",
        "name": "inspected_all_controls",
        "title": "Have you inspected ALL Stormwater controls including pollution prevention measures?"
       },
       {
        "type": "boolean",
        "name": "inspected_material_storage",
        "title": "Have you inspected ALL material, waste, borrow or equipment storage and maintenance areas?"
       },
       {
        "type": "boolean",
        "name": "inspected_flows",
        "title": "Have you inspected ALL areas where Stormwater flows within the site?"
       },
       {
        "type": "boolean",
        "name": "inspected_all_discharge",
        "title": "Have you inspected ALL points of discharge?  "
       },
       {
        "type": "boolean",
        "name": "inspected_all_stabilization",
        "title": "Have you inspected ALL locations where stabilization measures have been implemented?"
       },
       {
        "type": "boolean",
        "name": "described_unsage_areas",
        "title": "If you declared a portion of the site unsafe to inspect, have you described the reasoning?"
       }
      ],
      "title": "Audit"
     },
     {
      "name": "page2",
      "elements": [
       {
        "type": "panel",
        "name": "ip-1",
        "elements": [
         {
          "type": "file",
          "name": "pic_ip-1",
          "title": "Picture of Inlet Protection IP-1"
         },
         {
          "type": "dropdown",
          "name": "ip-1_condition",
          "title": "Current Condition",
          "choices": [
           {
            "value": "satisfactory",
            "text": "Satisfactory"
           },
           {
            "value": "maintenance_needed",
            "text": "Maintenance Needed"
           },
           {
            "value": "maintenance_performed",
            "text": "Maintenance Performed"
           },
           {
            "value": "winter_conditions",
            "text": "Winter Conditions"
           },
           {
            "value": "not_required",
            "text": "Not required at this time"
           },
           {
            "value": "initial",
            "text": "Initial Inspection"
           }
          ]
         },
         {
          "type": "text",
          "name": "ip-1_observations",
          "title": "Observations"
         },
         {
          "type": "text",
          "name": "ip-1_actions_date_initials",
          "title": "Actions taken, Date, Initials"
         }
        ],
        "title": "IP-1"
       },
       {
        "type": "panel",
        "name": "bmp_notes_panel",
        "elements": [
         {
          "type": "text",
          "name": "bmp_notes",
          "title": "Observations"
         },
         {
          "type": "file",
          "name": "pic_notes",
          "title": "Additional Pictures"
         }
        ],
        "title": "Notes"
       },
       {
        "type": "text",
        "name": "swmp_map",
        "title": "SWMP Map"
       }
      ],
      "title": "BMP Inspection"
     },
     {
      "name": "page3",
      "elements": [
       {
        "type": "panel",
        "name": "swmp_updates",
        "elements": [
         {
          "type": "boolean",
          "name": "swmp_changes",
          "title": "Are there any changes to the SWMP Plan that need to be updated? Pollution sources, BMPs, etc."
         },
         {
          "type": "text",
          "name": "swmp_plan_updates",
          "visibleIf": "{swmp_changes} = true",
          "title": "SWMP Plan Upate Description"
         }
        ],
        "title": "SWMP Plan Updates"
       }
      ],
      "title": "SWMP Plan Updates"
     },
     {
      "name": "page4",
      "elements": [
       {
        "type": "panel",
        "name": "inspection_certification_panel",
        "elements": [
         {
          "type": "dropdown",
          "name": "inspection_certification",
          "title": "I certify under penalty of law that this document and all attachments were prepared under my direction or supervision in accordance withe a system designed to assure that qualified personnel properly gathered and evaluated the information submitted. Based on my inquiry of the person or persons who manage the system, or those persons directly responsible for gathering the information, the information submitted is, to the best of my knowledge and belief, true, accurate and complete.  I am aware that there are significant penalties for submitting false information, including the possibility of fine and imprisonment for knowing violations.",
          "isRequired": true,
          "choices": [
           {
            "value": "safe",
            "text": "Safe"
           },
           {
            "value": "at_risk",
            "text": "At Risk"
           },
           {
            "value": "na",
            "text": "N/A"
           }
          ]
         },
         {
          "type": "signaturepad",
          "name": "inspection_certification_inspector_signature",
          "title": "Inspector Signature"
         },
         {
          "type": "signaturepad",
          "name": "inspection_certification_other_signature",
          "title": "Other Signature"
         }
        ],
        "title": "Inspection Certification"
       },
       {
        "type": "panel",
        "name": "compliance_certification_panel",
        "elements": [
         {
          "type": "dropdown",
          "name": "compliance_certification",
          "title": "Corrective action(s) has been taken, or where a report does not identify any incidents requiring corrective action, the report shall contain a signed statement indicating the site is in compliance with the permit to the best of the signer’s knowledge and belief.",
          "isRequired": true,
          "choices": [
           {
            "value": "safe",
            "text": "Safe"
           },
           {
            "value": "at_risk",
            "text": "At Risk"
           },
           {
            "value": "na",
            "text": "N/A"
           }
          ]
         },
         {
          "type": "signaturepad",
          "name": "compliance_certification_inspector_signature",
          "title": "Inspector Signature"
         },
         {
          "type": "signaturepad",
          "name": "compliance_certification_other_signature",
          "title": "Other Signature"
         }
        ],
        "title": "Compliance Certification"
       }
      ],
      "title": "Certification"
     }
    ],
    "showTitle": false,
    "showQuestionNumbers": "off",
    "mode": "display"
   };